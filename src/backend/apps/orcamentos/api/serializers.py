from rest_framework import serializers

from ..models import Cliente, Orcamento, ItemOrcamento, Pagamento
from ..services.atomicidade import atualizar_item, criar_item, recalcular_orcamento, remover_item
from ..services.calculos import calcular_desconto, calcular_total


class ItemOrcamentoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ItemOrcamento
        fields = ("id", "tipo", "descricao", "quantidade", "preco_unitario", "valor")
        read_only_fields = ("valor",)

    def create(self, validated_data):
        from ..services.atomicidade import criar_item
        return criar_item(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        from apps.orcamentos.services.atomicidade import recalcular_orcamento
        recalcular_orcamento(instance.orcamento)

        return instance


class PagamentoInputSerializer(serializers.Serializer):
    forma_pagamento = serializers.ChoiceField(choices=Pagamento.FORMA_PAGAMENTO_CHOICES)
    prazo_entrega = serializers.CharField(max_length=50)
    desconto_percentual = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
        required=False,
    )


class OrcamentoSerializer(serializers.ModelSerializer):
    # Dados do cliente
    cliente_nome = serializers.CharField(required=False, allow_blank=True)
    cpf_cnpj = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    celular_wpp = serializers.CharField(required=False, allow_blank=True)
    instagram = serializers.CharField(required=False, allow_blank=True)
    facebook = serializers.CharField(required=False, allow_blank=True)

    # Serviço
    tipo = serializers.ChoiceField(choices=Orcamento.TIPO_SERVICO_CHOICES, required=False)
    descricao = serializers.CharField(required=False, allow_blank=True)
    quantidade = serializers.IntegerField(required=False, min_value=1)
    preco_unitario = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, min_value=0)
    itens = ItemOrcamentoSerializer(many=True, required=False)
    pagamento = PagamentoInputSerializer(required=False)

    # Alias pedido para o total
    valor_total = serializers.DecimalField(source="total", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Orcamento
        fields = (
            "id",
            "numero_registro",
            "cliente",
            "cliente_nome",
            "cpf_cnpj",
            "email",
            "celular_wpp",
            "instagram",
            "facebook",
            "tipo_servico",
            "tipo",
            "descricao",
            "quantidade",
            "preco_unitario",
            "itens",
            "pagamento",
            "subtotal",
            "desconto_percentual",
            "desconto_valor",
            "total",
            "valor_total",
            "observacoes",
            "criado_em",
        )
        read_only_fields = (
            "numero_registro",
            "subtotal",
            "desconto_valor",
            "total",
            "valor_total",
            "criado_em",
        )
        extra_kwargs = {
            "cliente": {"required": False},
            "tipo_servico": {"required": False},
        }

    def _principal_item(self, orcamento: Orcamento):
        return orcamento.itens.order_by("id").first()

    def _normalizar_itens_payload(self, validated_data, tipo_padrao: str | None, exigir: bool):
        itens = validated_data.pop("itens", None)

        # Compatibilidade transitória com payload legado de item único.
        descricao = validated_data.pop("descricao", None)
        quantidade = validated_data.pop("quantidade", None)
        preco_unitario = validated_data.pop("preco_unitario", None)

        if itens is None and any(field is not None for field in [descricao, quantidade, preco_unitario]):
            if descricao in (None, ""):
                raise serializers.ValidationError({"descricao": "Este campo é obrigatório."})
            if quantidade is None:
                raise serializers.ValidationError({"quantidade": "Este campo é obrigatório."})
            if preco_unitario is None:
                raise serializers.ValidationError({"preco_unitario": "Este campo é obrigatório."})

            itens = [{
                "tipo": tipo_padrao,
                "descricao": descricao,
                "quantidade": quantidade,
                "preco_unitario": preco_unitario,
            }]

        if exigir and not itens:
            raise serializers.ValidationError({"itens": "Informe ao menos um item."})

        if itens is not None and len(itens) == 0:
            raise serializers.ValidationError({"itens": "Informe ao menos um item."})

        itens_normalizados = []
        for item in itens or []:
            item_data = dict(item)
            item_data["tipo"] = item_data.get("tipo") or tipo_padrao
            if not item_data.get("tipo"):
                raise serializers.ValidationError({"itens": "Cada item deve informar um tipo válido."})
            itens_normalizados.append(item_data)

        return itens_normalizados if itens is not None else None

    def _sincronizar_itens(self, instance: Orcamento, itens_payload):
        itens_atuais = {item.id: item for item in instance.itens.all()}
        itens_para_manter = set()

        for item_data in itens_payload:
            item_id = item_data.pop("id", None)
            if item_id is None:
                novo_item = criar_item(orcamento=instance, **item_data)
                itens_para_manter.add(novo_item.id)
                continue

            item_existente = itens_atuais.get(item_id)
            if item_existente is None:
                raise serializers.ValidationError(
                    {"itens": f"Item {item_id} não pertence ao orçamento {instance.id}."}
                )

            atualizar_item(item_existente, **item_data)
            itens_para_manter.add(item_existente.id)

        for item in instance.itens.all():
            if item.id not in itens_para_manter:
                remover_item(item)

    def _representar_pagamento(self, instance: Orcamento):
        pagamento = getattr(instance, "pagamento", None)
        if not pagamento:
            return None

        return {
            "forma_pagamento": pagamento.forma_pagamento,
            "prazo_entrega": pagamento.prazo_entrega,
            "subtotal": str(pagamento.subtotal),
            "desconto_percentual": str(pagamento.desconto_percentual),
            "desconto_valor": str(pagamento.desconto_valor),
            "total": str(pagamento.total),
        }

    def _sincronizar_pagamento(self, instance: Orcamento, pagamento_payload):
        if pagamento_payload is None:
            return

        forma_pagamento = pagamento_payload["forma_pagamento"]
        prazo_entrega = pagamento_payload["prazo_entrega"]
        desconto_percentual = pagamento_payload.get(
            "desconto_percentual",
            instance.desconto_percentual,
        )
        subtotal = instance.subtotal
        desconto_valor = calcular_desconto(subtotal, desconto_percentual)
        total = calcular_total(subtotal, desconto_valor)

        pagamento = getattr(instance, "pagamento", None)
        if pagamento is None:
            Pagamento.objects.create(
                orcamento=instance,
                forma_pagamento=forma_pagamento,
                prazo_entrega=prazo_entrega,
                subtotal=subtotal,
                desconto_percentual=desconto_percentual,
                desconto_valor=desconto_valor,
                total=total,
            )
            return

        pagamento.forma_pagamento = forma_pagamento
        pagamento.prazo_entrega = prazo_entrega
        pagamento.subtotal = subtotal
        pagamento.desconto_percentual = desconto_percentual
        pagamento.desconto_valor = desconto_valor
        pagamento.total = total
        pagamento.save()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        item = self._principal_item(instance)

        data["cliente_nome"] = instance.cliente.nome
        data["cpf_cnpj"] = instance.cliente.cpf_cnpj
        data["email"] = instance.cliente.email
        data["celular_wpp"] = instance.cliente.celular
        data["instagram"] = instance.cliente.instagram
        data["facebook"] = instance.cliente.facebook

        data["tipo"] = instance.tipo_servico
        data["descricao"] = item.descricao if item else ""
        data["quantidade"] = item.quantidade if item else None
        data["preco_unitario"] = str(item.preco_unitario) if item else None
        data["itens"] = ItemOrcamentoSerializer(instance.itens.order_by("id"), many=True).data
        data["pagamento"] = self._representar_pagamento(instance)

        return data

    def _resolver_cliente(self, validated_data):
        cliente = validated_data.get("cliente")
        cliente_nome = (validated_data.pop("cliente_nome", "") or "").strip()
        cpf_cnpj = (validated_data.pop("cpf_cnpj", "") or "").strip()
        email = (validated_data.pop("email", "") or "").strip()
        celular_wpp = (validated_data.pop("celular_wpp", "") or "").strip()
        instagram = (validated_data.pop("instagram", "") or "").strip()
        facebook = (validated_data.pop("facebook", "") or "").strip()

        if cliente is not None:
            return cliente, cliente_nome, cpf_cnpj, email, celular_wpp, instagram, facebook

        if all([cliente_nome, cpf_cnpj, email, celular_wpp]):
            cliente = Cliente.objects.create(
                nome=cliente_nome,
                cpf_cnpj=cpf_cnpj,
                celular=celular_wpp,
                email=email,
                instagram=instagram,
                facebook=facebook,
            )
            return cliente, cliente_nome, cpf_cnpj, email, celular_wpp, instagram, facebook

        cliente = Cliente.objects.order_by("id").first()
        if cliente is None:
            cliente = Cliente.objects.create(
                nome="Cliente padrão",
                cpf_cnpj="00000000000",
                celular="00000000000",
                email="cliente.padrao@local.invalid",
                instagram="",
                facebook="",
            )
        return cliente, cliente_nome, cpf_cnpj, email, celular_wpp, instagram, facebook

    def create(self, validated_data):
        cliente, _, _, _, _, _, _ = self._resolver_cliente(validated_data)
        pagamento_payload = validated_data.pop("pagamento", None)

        tipo = validated_data.pop("tipo", None) or validated_data.get("tipo_servico")
        if not tipo:
            raise serializers.ValidationError({"tipo": "Este campo é obrigatório."})

        itens_payload = self._normalizar_itens_payload(
            validated_data=validated_data,
            tipo_padrao=tipo,
            exigir=True,
        )

        validated_data["cliente"] = cliente
        validated_data["tipo_servico"] = tipo

        orcamento = Orcamento.objects.create(**validated_data)

        for item_data in itens_payload:
            criar_item(orcamento=orcamento, **item_data)

        self._sincronizar_pagamento(orcamento, pagamento_payload)

        return orcamento

    def update(self, instance, validated_data):
        _, cliente_nome, cpf_cnpj, email, celular_wpp, instagram, facebook = self._resolver_cliente(validated_data)
        pagamento_payload = validated_data.pop("pagamento", None)

        if cliente_nome:
            instance.cliente.nome = cliente_nome
        if cpf_cnpj:
            instance.cliente.cpf_cnpj = cpf_cnpj
        if email:
            instance.cliente.email = email
        if celular_wpp:
            instance.cliente.celular = celular_wpp
        if instagram:
            instance.cliente.instagram = instagram
        if facebook:
            instance.cliente.facebook = facebook
        instance.cliente.save()

        tipo = validated_data.pop("tipo", None)

        if tipo is not None:
            validated_data["tipo_servico"] = tipo

        itens_payload = self._normalizar_itens_payload(
            validated_data=validated_data,
            tipo_padrao=validated_data.get("tipo_servico", instance.tipo_servico),
            exigir=False,
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if itens_payload is not None:
            self._sincronizar_itens(instance, itens_payload)
        else:
            if tipo is not None:
                instance.itens.update(tipo=instance.tipo_servico)
            recalcular_orcamento(instance)

        instance.refresh_from_db()
        self._sincronizar_pagamento(instance, pagamento_payload)

        return instance


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        exclude = ("orcamento",)
        read_only_fields = ("desconto_valor", "total")

    def create(self, validated_data):
        raise NotImplementedError(
            "Use o service criar_pagamento() para criar pagamentos."
        )


class SimularOrcamentoSerializer(serializers.Serializer):
    quantidade = serializers.IntegerField(min_value=1)
    preco_unitario = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=0
    )
    desconto_percentual = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
        required=False,
        default=0
    )

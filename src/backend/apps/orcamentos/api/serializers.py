from rest_framework import serializers
from ..models import Cliente, Orcamento, ItemOrcamento, Pagamento

class OrcamentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Orcamento
        fields = "__all__"
        read_only_fields = (
            "numero",
            "subtotal",
            "desconto_valor",
            "total",
            "criado_em",
        )
    
    def update(self, instance, validated_data):
        instance.desconto_percentual = validated_data.get(
            "desconto_percentual",
            instance.desconto_percentual
        )
        instance.save()

        from apps.orcamentos.services.atomicidade import recalcular_orcamento
        recalcular_orcamento(instance)

        return instance
        
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"

class ItemOrcamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOrcamento
        exclude = ("orcamento",)
        read_only_fields = ("valor",)
    
    def create(self, validated_data):
        from apps.orcamentos.services.atomicidade import criar_item
        return criar_item(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        from apps.orcamentos.services.atomicidade import recalcular_orcamento
        recalcular_orcamento(instance.orcamento)

        return instance

class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        exclude = ("orcamento",)
        read_only_fields = ("desconto_valor", "total")

    def create(self, validated_data):
        raise NotImplementedError(
            "Use o service criar_pagamento() para criar pagamentos."
        )

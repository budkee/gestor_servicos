from django.db import transaction
from decimal import Decimal
from django.db.models import Sum

from ..models import Orcamento, ItemOrcamento, Pagamento
from .calculos import (
    calcular_valor_item,
    calcular_desconto,
    calcular_total
)

@transaction.atomic
def recalcular_orcamento(orcamento: Orcamento):
    """
    Recalcula subtotal, desconto e total do orçamento com lock para evitar concorrência.
    """

    # Lock do orçamento
    orcamento = (
        Orcamento.objects
        .select_for_update()
        .get(pk=orcamento.pk)
    )

    subtotal = (
        orcamento.itens
        .aggregate(total=Sum("valor"))
        .get("total") or Decimal("0.00")
    )

    desconto_valor = calcular_desconto(
        subtotal,
        orcamento.desconto_percentual
    )

    total = calcular_total(
        subtotal,
        desconto_valor
    )

    orcamento.subtotal = subtotal
    orcamento.desconto_valor = desconto_valor
    orcamento.total = total
    orcamento.save()

    return orcamento

@transaction.atomic
def criar_item(orcamento: Orcamento, **dados):
    """
    Cria item e recalcula orçamento
    """

    valor = calcular_valor_item(
        dados["quantidade"],
        dados["preco_unitario"]
    )

    item = ItemOrcamento.objects.create(
        orcamento=orcamento,
        valor=valor,
        **dados
    )

    recalcular_orcamento(orcamento)

    return item

@transaction.atomic
def remover_item(item: ItemOrcamento):
    orcamento = item.orcamento
    item.delete()
    recalcular_orcamento(orcamento)

@transaction.atomic
def atualizar_item(item: ItemOrcamento, **dados):
    
    # Lock do orçamento (protege concorrência)
    orcamento = (
        Orcamento.objects
        .select_for_update()
        .get(pk=item.orcamento.pk)
    )

    for attr, value in dados.items():
        setattr(item, attr, value)

    item.valor = calcular_valor_item(
        item.quantidade,
        item.preco_unitario
    )
    item.save()  # deixa o Django decidir update_fields

    recalcular_orcamento(item.orcamento)

    return item

@transaction.atomic
def criar_pagamento(**dados):
    subtotal = dados["subtotal"]
    desconto_percentual = dados["desconto_percentual"]

    desconto_valor = calcular_desconto(
        subtotal,
        desconto_percentual
    )

    total = calcular_total(
        subtotal,
        desconto_valor
    )

    pagamento = Pagamento.objects.create(
        desconto_valor=desconto_valor,
        total=total,
        **dados
    )
    return pagamento
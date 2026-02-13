from django.db import transaction
from decimal import Decimal
from django.db.models import Sum

from orcamentos.models import Orcamento, ItemOrcamento
from orcamentos.services.calculos import (
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
    orcamento.save(update_fields=[
        "subtotal",
        "desconto_valor",
        "total"
    ])

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

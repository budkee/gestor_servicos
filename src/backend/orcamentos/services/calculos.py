from decimal import Decimal


def calcular_valor_item(quantidade, preco_unitario):
    """
    Valor do item = quantidade * preço unitário
    """
    return Decimal(quantidade) * Decimal(preco_unitario)


def calcular_subtotal(itens):
    """
    Subtotal = soma dos valores dos itens
    """
    return sum((item.valor for item in itens), Decimal("0.00"))


def calcular_desconto(subtotal, desconto_percentual):
    """
    Desconto em valor a partir do percentual
    """
    subtotal = Decimal(str(subtotal))
    desconto_percentual = Decimal(str(desconto_percentual))
    return subtotal * (desconto_percentual / Decimal("100"))


def calcular_total(subtotal, desconto_valor):
    """
    Total nunca pode ser negativo
    """
    subtotal = Decimal(str(subtotal))
    desconto_valor = Decimal(str(desconto_valor))
    total = subtotal - desconto_valor
    return max(total, Decimal("0.00"))

from decimal import Decimal
from django.test import TestCase
from django.utils import timezone

from ..models import (
    Orcamento, 
    Cliente, 
    ItemOrcamento
)
from ..services.atomicidade import (
    criar_item,
    remover_item,
    recalcular_orcamento
)
from ..services.calculos import (
    calcular_valor_item,
    calcular_subtotal,
    calcular_desconto,
    calcular_total
)

# ==============================================
# REGRAS DE NEGÓCIO DO ORÇAMENTO
# ==============================================
class OrcamentoServiceTest(TestCase):
    """
    Diferença para os cálculos puros:
    - Aqui há interação com banco de dados
    - Há efeitos colaterais (persistência)
    - Há atualização automática do orçamento
    
    Esses testes garantem que:
    - Criar item recalcula totais
    - Remover item recalcula totais
    - Recalcular manual funciona corretamente
    
    É a camada que conecta MODEL + FUNÇÕES DE CÁLCULO.
    """

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            cpf_cnpj="12345678900",
            celular="999999999",
            email="teste@email.com"
        )

        self.orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO",
            desconto_percentual=10
        )

    def test_item_calcula_valor(self):
        """
        Garante que o valor do item é calculado
        automaticamente (quantidade x preço).
        """
        item = ItemOrcamento.objects.create(
            orcamento=self.orcamento,
            tipo="ORCAMENTO",
            descricao="Vestido",
            quantidade=2,
            preco_unitario="50.00"
        )

        self.assertEqual(item.valor, Decimal("100.00"))

    def test_criar_item_recalcula_totais(self):
        """
        Testa o fluxo completo do serviço criar_item:

        1. Cria o item
        2. Recalcula subtotal
        3. Aplica desconto
        4. Atualiza total

        Este teste valida o comportamento integrado do service.
        """
        criar_item(
            orcamento=self.orcamento,
            tipo="ORCAMENTO",
            descricao="Vestido",
            quantidade=2,
            preco_unitario="50.00"
        )

        self.orcamento.refresh_from_db()

        self.assertEqual(self.orcamento.subtotal, Decimal("100.00"))
        self.assertEqual(self.orcamento.desconto_valor, Decimal("10.00"))
        self.assertEqual(self.orcamento.total, Decimal("90.00"))

    def test_remover_item_recalcula_totais(self):
        """
        Testa o fluxo do serviço remover_item:

        1. Remove o item
        2. Recalcula subtotal
        3. Atualiza total

        Garante que o orçamento nunca fique com valores inconsistentes.
        """
        item = criar_item(
            orcamento=self.orcamento,
            tipo="ORCAMENTO",
            descricao="Vestido",
            quantidade=2,
            preco_unitario="50.00"
        )

        remover_item(item)
        self.orcamento.refresh_from_db()

        self.assertEqual(self.orcamento.subtotal, Decimal("0.00"))
        self.assertEqual(self.orcamento.total, Decimal("0.00"))

    def test_recalcular_orcamento_manual(self):
        """
        Testa apenas a função recalcular_orcamento isoladamente.

        Útil para cenários onde:
        - Itens foram criados manualmente
        - Houve alteração direta no banco
        - Migrações antigas precisam ajustar valores

        NÃO testa criar_item.
        NÃO testa remover_item.
        """
        ItemOrcamento.objects.create(
            orcamento=self.orcamento,
            tipo="ORCAMENTO",
            descricao="Saia",
            quantidade=1,
            preco_unitario="200.00",
            valor="200.00"
        )

        recalcular_orcamento(self.orcamento)
        self.orcamento.refresh_from_db()

        self.assertEqual(self.orcamento.subtotal, Decimal("200.00"))
        self.assertEqual(self.orcamento.desconto_valor, Decimal("20.00"))
        self.assertEqual(self.orcamento.total, Decimal("180.00"))


# ==============================================
# CÁLCULOS PUROS (FUNÇÕES ISOLADAS)
# ==============================================

class CalculosServiceTest(TestCase):
    """
    Aqui testamos funções puras.
    
    Diferença para o Service:
    - NÃO acessam banco
    - NÃO alteram modelos
    - NÃO possuem efeitos colaterais
    
    Apenas recebem valores e retornam resultados.
    São determinísticas e fáceis de testar.
    """
    def test_calcular_valor_item(self):
        """
        quantidade x preço_unitario
        """
        valor = calcular_valor_item(2, "10.00")
        self.assertEqual(valor, Decimal("20.00"))

    def test_calcular_subtotal(self):
        """
        Soma dos valores de uma lista de itens.
        """
        class FakeItem:
            def __init__(self, valor):
                self.valor = Decimal(valor)

        itens = [FakeItem("10.00"), FakeItem("20.00")]
        subtotal = calcular_subtotal(itens)

        self.assertEqual(subtotal, Decimal("30.00"))

    def test_calcular_desconto(self):
        """
        Aplica percentual de desconto sobre subtotal.
        """
        desconto = calcular_desconto(Decimal("100.00"), Decimal("10"))
        self.assertEqual(desconto, Decimal("10.00"))

    def test_calcular_total_nunca_negativo(self):
        """
        Garante que o total nunca seja negativo,
        mesmo se o desconto for maior que o subtotal.
        """
        total = calcular_total(Decimal("50.00"), Decimal("100.00"))
        self.assertEqual(total, Decimal("0.00"))
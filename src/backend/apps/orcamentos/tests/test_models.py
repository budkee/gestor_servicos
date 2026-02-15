from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from ..models import (
    Orcamento, 
    ItemOrcamento,
    Cliente,
    Pagamento
)
from ..services.atomicidade import criar_pagamento

# ==============================================
# REGISTROS DE ORÇAMENTO
# ==============================================
class NumeroOrcamentoTest(TestCase):
    """
    Esta classe testa apenas a responsabilidade do MODEL relacionada à geração e controle do número de registro.

    Aqui NÃO testamos cálculos, apenas:
    - Geração automática
    - Sequência
    - Unicidade

    Ou seja: responsabilidade estrutural do Orçamento.
    """

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            cpf_cnpj="12345678900",
            celular="999999999",
            email="teste@email.com"
        )

    def test_numero_registro_gerado_automaticamente(self):
        """
        Testa apenas se:
        - O campo numero_registro é preenchido automaticamente
        - O prefixo contém o ano atual

        NÃO testa sequência.
        NÃO testa unicidade.
        """
        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        self.assertIsNotNone(orcamento.numero_registro)
        self.assertTrue(
            orcamento.numero_registro.startswith(f"RB-{timezone.now().year}")
        )

    def test_numero_registro_sequencial(self):
        """
        Testa apenas se:
        - Dois orçamentos criados em sequência possuem números incrementais.

        NÃO testa padrão.
        NÃO testa unicidade em lote.
        """
        orc1 = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        orc2 = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        numero1 = int(orc1.numero_registro.split("-")[-1])
        numero2 = int(orc2.numero_registro.split("-")[-1])

        self.assertEqual(numero2, numero1 + 1)

    def test_numero_registro_unico(self):
        """
        Testa apenas se:
        - Múltiplas criações geram números únicos.

        NÃO testa sequência exata.
        NÃO testa padrão.
        """
        numeros = [
            Orcamento.objects.create(
                cliente=self.cliente,
                tipo_servico="ORCAMENTO"
            ).numero_registro
            for _ in range(5)
        ]

        self.assertEqual(len(numeros), len(set(numeros)))


# =========================
# Pagamento
# =========================
class PagamentoModelTest(TestCase):

    def setUp(self):
        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            cpf_cnpj="12345678900",
            celular="999999999",
            email="teste@email.com"
        )

        self.orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

    def test_pagamento_calcula_total(self):
        """
        Garante que o model Pagamento:
        - Calcula desconto_valor automaticamente
        - Calcula total corretamente
        """

        pagamento = criar_pagamento(
            orcamento=self.orcamento,
            forma_pagamento="PIX",
            prazo_entrega="10 dias",
            subtotal=Decimal("100.00"),
            desconto_percentual=Decimal("20.00")
        )

        self.assertEqual(pagamento.desconto_valor, Decimal("20.00"))
        self.assertEqual(pagamento.total, Decimal("80.00"))

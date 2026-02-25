from django.urls import reverse
from django.contrib.auth.models import User
from decimal import Decimal
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from apps.orcamentos.models import Cliente, Orcamento

# =========================
# API de Orçamento
# =========================
class OrcamentoAPITest(APITestCase):
    """
    # Testa:
    - Listagem
    - Criação
    - Recuperação individual
    - Erros esperados (404 / 401)
    """
    def setUp(self):
        self.user = User.objects.create_user(
            username="teste",
            password="123456"
        )
    
        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            cpf_cnpj="12345678900",
            celular="999999999",
            email="teste@email.com",
            instagram="@cliente_teste",
            facebook="Cliente Teste"
        )

        self.url = reverse("orcamento-list") 

    # =========================
    # LISTAGEM REQUER LOGIN
    # =========================
    def test_listagem_requer_autenticacao(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================
    # LISTAR
    # =========================
    def test_listar_orcamentos_autenticado(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_simular_orcamento(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("orcamento-simular")

        payload = {
            "quantidade": 2,
            "preco_unitario": "50.00",
            "desconto_percentual": 10
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data["subtotal"])), Decimal("100.00"))
        self.assertEqual(Decimal(str(response.data["desconto_valor"])), Decimal("10.00"))
        self.assertEqual(Decimal(str(response.data["total"])), Decimal("90.00"))

    # =========================
    # CRIAR
    # =========================
    def test_criar_orcamento(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "cliente": self.cliente.id,
            "tipo": "ORCAMENTO",
            "descricao": "Ajuste de barra",
            "quantidade": 2,
            "preco_unitario": "50.00",
            "desconto_percentual": 10,
            "pagamento": {
                "forma_pagamento": "PIX",
                "prazo_entrega": "5 dias úteis",
                "desconto_percentual": 8,
            },
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Orcamento.objects.count(), 1)

        orcamento = Orcamento.objects.first()
        self.assertEqual(orcamento.cliente, self.cliente)
        self.assertEqual(orcamento.desconto_percentual, 10)
        self.assertEqual(orcamento.pagamento.forma_pagamento, "PIX")
        self.assertEqual(orcamento.pagamento.prazo_entrega, "5 dias úteis")
        self.assertEqual(orcamento.pagamento.desconto_percentual, Decimal("8.00"))

    def test_criar_orcamento_sem_cliente_usa_cliente_padrao(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "tipo": "ORCAMENTO",
            "descricao": "Ajuste de manga",
            "quantidade": 1,
            "preco_unitario": "100.00",
            "desconto_percentual": 5,
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        orcamento = Orcamento.objects.get(id=response.data["id"])
        self.assertEqual(orcamento.cliente, self.cliente)

    def test_criar_orcamento_sem_cliente_cria_cliente_padrao_quando_necessario(self):
        self.client.force_authenticate(user=self.user)
        Cliente.objects.all().delete()

        payload = {
            "tipo": "ORCAMENTO",
            "descricao": "Reforma de vestido",
            "quantidade": 1,
            "preco_unitario": "100.00",
            "desconto_percentual": 5,
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cliente.objects.count(), 1)

        orcamento = Orcamento.objects.get(id=response.data["id"])
        self.assertEqual(orcamento.cliente.nome, "Cliente padrão")

    def test_criar_orcamento_com_dados_cliente_cria_cliente(self):
        self.client.force_authenticate(user=self.user)
        Cliente.objects.all().delete()

        payload = {
            "tipo": "ORCAMENTO",
            "descricao": "Conserto geral",
            "quantidade": 3,
            "preco_unitario": "40.00",
            "desconto_percentual": 12,
            "cliente_nome": "Maria da Silva",
            "cpf_cnpj": "12345678900",
            "celular_wpp": "11999999999",
            "email": "maria@email.com",
            "instagram": "@maria",
            "facebook": "Maria da Silva",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cliente.objects.count(), 1)

        cliente = Cliente.objects.first()
        self.assertEqual(cliente.nome, "Maria da Silva")
        self.assertEqual(cliente.cpf_cnpj, "12345678900")
        self.assertEqual(cliente.celular, "11999999999")
        self.assertEqual(cliente.email, "maria@email.com")
        self.assertEqual(cliente.instagram, "@maria")
        self.assertEqual(cliente.facebook, "Maria da Silva")

        orcamento = Orcamento.objects.get(id=response.data["id"])
        self.assertEqual(orcamento.cliente, cliente)

    # =========================
    # DETALHAR
    # =========================
    def test_detalhar_orcamento(self):
        self.client.force_authenticate(user=self.user)

        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        url = reverse("orcamento-api-detail", args=[orcamento.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], orcamento.id)
        self.assertEqual(response.data["instagram"], "@cliente_teste")
        self.assertEqual(response.data["facebook"], "Cliente Teste")

    # =========================
    # 404
    # =========================
    def test_detalhar_orcamento_inexistente(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("orcamento-api-detail", args=[999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # =========================
    # EXPORTAR PDF
    # =========================
    def test_exportar_pdf_requer_autenticacao(self):
        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )
        url = reverse("orcamento-pdf", args=[orcamento.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_exportar_pdf(self):
        self.client.force_authenticate(user=self.user)
        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )
        url = reverse("orcamento-pdf", args=[orcamento.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("attachment;", response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"%PDF"))

    # =========================
    # ATUALIZAR
    # =========================
    def test_atualizar_orcamento(self):
        self.client.force_authenticate(user=self.user)

        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO",
            observacoes="Inicial"
        )

        url = reverse("orcamento-api-detail", args=[orcamento.id])
        payload = {
            "tipo_servico": "AJUSTE",
            "desconto_percentual": 15,
            "observacoes": "Atualizado",
            "instagram": "@cliente_editado",
            "facebook": "Cliente Editado",
            "pagamento": {
                "forma_pagamento": "DEBITO",
                "prazo_entrega": "10 dias corridos",
                "desconto_percentual": 5,
            },
        }
        response = self.client.patch(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        orcamento.refresh_from_db()
        orcamento.cliente.refresh_from_db()
        self.assertEqual(orcamento.tipo_servico, "AJUSTE")
        self.assertEqual(orcamento.desconto_percentual, 15)
        self.assertEqual(orcamento.observacoes, "Atualizado")
        self.assertEqual(orcamento.cliente.instagram, "@cliente_editado")
        self.assertEqual(orcamento.cliente.facebook, "Cliente Editado")
        self.assertEqual(orcamento.pagamento.forma_pagamento, "DEBITO")
        self.assertEqual(orcamento.pagamento.prazo_entrega, "10 dias corridos")
        self.assertEqual(orcamento.pagamento.desconto_percentual, Decimal("5.00"))

    # =========================
    # REMOVER
    # =========================
    def test_remover_orcamento(self):
        self.client.force_authenticate(user=self.user)

        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        url = reverse("orcamento-api-detail", args=[orcamento.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Orcamento.objects.filter(id=orcamento.id).exists())

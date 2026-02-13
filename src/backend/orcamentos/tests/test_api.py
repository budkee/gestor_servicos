from django.urls import reverse
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from orcamentos.models import Cliente, Orcamento

# =========================
# API de Orçamento
# =========================
class OrcamentoAPITest(TestCase):
    """
    # Testa:
    - Autenticação
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
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    # =========================
    # LISTAR - GET
    # =========================
    def test_listar_orcamentos(self):
        url = reverse("orcamento-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    # =========================
    # CRIAR - POST
    # =========================
    def test_criar_orcamento(self):
        url = reverse("orcamento-list")

        payload = {
            "cliente": self.cliente.id,
            "tipo_servico": "ORCAMENTO",
            "desconto_percentual": 10
        }

        response = self.client.post(url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Orcamento.objects.count(), 1)

        orcamento = Orcamento.objects.first()
        self.assertEqual(orcamento.cliente, self.cliente)
        self.assertEqual(orcamento.desconto_percentual, 10)

    # =========================
    # DETALHE - GET
    # =========================
    def test_detalhar_orcamento(self):
        orcamento = Orcamento.objects.create(
            cliente=self.cliente,
            tipo_servico="ORCAMENTO"
        )

        url = reverse("orcamento-api-detail", args=[orcamento.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], orcamento.id)

    # =========================
    # 404 - GET
    # =========================
    def test_detalhar_orcamento_inexistente(self):
        url = reverse("orcamento-api-detail", args=[999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # =========================
    # AUTENTICAÇÃO - GET
    # =========================
    def test_api_exige_autenticacao(self):
        self.client.force_authenticate(user=None)

        url = reverse("orcamento-list")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


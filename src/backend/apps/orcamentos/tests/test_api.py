from django.urls import reverse
from django.contrib.auth.models import User
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
            email="teste@email.com"
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

    # =========================
    # CRIAR
    # =========================
    def test_criar_orcamento(self):
        self.client.force_authenticate(user=self.user)

        payload = {
            "cliente": self.cliente.id,
            "tipo_servico": "ORCAMENTO",
            "desconto_percentual": 10
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Orcamento.objects.count(), 1)

        orcamento = Orcamento.objects.first()
        self.assertEqual(orcamento.cliente, self.cliente)
        self.assertEqual(orcamento.desconto_percentual, 10)

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

    # =========================
    # 404
    # =========================
    def test_detalhar_orcamento_inexistente(self):
        self.client.force_authenticate(user=self.user)

        url = reverse("orcamento-api-detail", args=[999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)



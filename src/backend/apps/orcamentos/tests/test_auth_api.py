from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterAPITest(APITestCase):
    def setUp(self):
        self.url = reverse("auth-register")

    def test_register_salva_nome_completo_e_username(self):
        payload = {
            "full_name": "Maria da Silva",
            "username": "maria.silva",
            "email": "maria@email.com",
            "password": "senha12345",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="maria.silva")
        self.assertEqual(user.first_name, "Maria da Silva")
        self.assertEqual(response.data["full_name"], "Maria da Silva")
        self.assertEqual(response.data["username"], "maria.silva")

    def test_register_rejeita_sem_nome_completo(self):
        payload = {
            "username": "joao.souza",
            "email": "joao@email.com",
            "password": "senha12345",
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("full_name", response.data)


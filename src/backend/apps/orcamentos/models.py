from decimal import Decimal
from django.conf import settings
from django.db.models import Max
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import (
    models, 
    transaction, 
    IntegrityError
)
from .services.calculos import calcular_valor_item

# =========================
# Cliente
# =========================
class Cliente(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="clientes",
        null=True,
        blank=True,
    )
    nome = models.CharField(max_length=255)
    cpf_cnpj = models.CharField(max_length=18)
    celular = models.CharField(max_length=20)
    email = models.EmailField()
    instagram = models.CharField(max_length=255, blank=True, default="")
    facebook = models.CharField(max_length=255, blank=True, default="")

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome


# =========================
# Orçamento
# =========================
class Orcamento(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orcamentos",
        null=True,
        blank=True,
    )
    
    numero_registro = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    def _gerar_numero_seguro(self):
        ano_atual = timezone.now().year

        while True:
            ultimo = (
                Orcamento.objects
                .filter(numero_registro__startswith=f"RB-{ano_atual}")
                .order_by("-numero_registro")
                .first()
            )

            if ultimo:
                ultimo_numero = int(ultimo.numero_registro.split("-")[-1])
                proximo = ultimo_numero + 1
            else:
                proximo = 1

            numero = f"RB-{ano_atual}-{proximo:03d}"

            # Verificação extra de segurança
            if not Orcamento.objects.filter(numero_registro=numero).exists():
                return numero
    
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="orcamentos"
    )

    
    TIPO_SERVICO_CHOICES = [
        ("ORCAMENTO", "Orçamento"),
        ("CONFECCAO", "Confecção"),
        ("AJUSTE", "Ajuste"),
    ]

    tipo_servico = models.CharField(
        max_length=20,
        choices=TIPO_SERVICO_CHOICES
    )

    observacoes = models.TextField(blank=True)

    # Campos financeiros
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    desconto_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    desconto_valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.numero_registro:
            self.numero_registro = self._gerar_numero_seguro()
        super().save(*args, **kwargs)


    def __str__(self):
        return self.numero_registro


# =========================
# Item do Orçamento
# =========================
class ItemOrcamento(models.Model):
    TIPO_ITEM_CHOICES = [
        ("ORCAMENTO", "Orçamento"),
        ("CONFECCAO", "Confecção"),
        ("AJUSTE", "Ajuste"),
    ]

    orcamento = models.ForeignKey(
        Orcamento,
        on_delete=models.CASCADE,
        related_name="itens"
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_ITEM_CHOICES
    )

    descricao = models.CharField(max_length=255)

    quantidade = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )

    preco_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )


    def delete(self, *args, **kwargs):
        with transaction.atomic():
            orcamento = self.orcamento
            super().delete(*args, **kwargs)

            orcamento.save()


    def save(self, *args, **kwargs):
            self.valor = calcular_valor_item(
                self.quantidade,
                self.preco_unitario
            )
            super().save(*args, **kwargs)

    def __str__(self):
        return self.descricao


# =========================
# Pagamento
# =========================
class Pagamento(models.Model):
    FORMA_PAGAMENTO_CHOICES = [
        ("PIX", "Pix"),
        ("DINHEIRO", "Dinheiro"),
        ("CREDITO", "Cartão de Crédito"),
        ("DEBITO", "Cartão de Débito"),
    ]

    orcamento = models.OneToOneField(
        Orcamento,
        on_delete=models.CASCADE,
        related_name="pagamento"
    )

    forma_pagamento = models.CharField(
        max_length=20,
        choices=FORMA_PAGAMENTO_CHOICES
    )

    prazo_entrega = models.CharField(max_length=50)

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )

    desconto_percentual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    desconto_valor = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        editable=False
    )


    def __str__(self):
        return f"Pagamento {self.orcamento.numero_registro}"

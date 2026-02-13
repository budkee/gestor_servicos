from rest_framework import serializers
from .models import Cliente, Orcamento, ItemOrcamento, Pagamento


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"


class ItemOrcamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOrcamento
        exclude = ("orcamento",)
        read_only_fields = ("valor",)


class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        exclude = ("orcamento",)
        read_only_fields = ("desconto_valor", "total")


class OrcamentoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Orcamento
        fields = "__all__"
        read_only_fields = (
            "numero",
            "subtotal",
            "desconto_valor",
            "total",
            "criado_em",
        )
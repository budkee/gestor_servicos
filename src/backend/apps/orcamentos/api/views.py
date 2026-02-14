from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import serializers

from weasyprint import HTML

from ..models import Orcamento, Pagamento
from .serializers import OrcamentoSerializer


# =========================
# API (JWT)
# =========================

class OrcamentoListCreateView(generics.ListCreateAPIView):
    queryset = Orcamento.objects.all().order_by("-criado_em")
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]


class OrcamentoRetrieveView(generics.RetrieveAPIView):
    queryset = Orcamento.objects.all()
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]


class ItemCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        orcamento = get_object_or_404(Orcamento, pk=pk)

        serializer = ItemOrcamentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = criar_item(
            orcamento=orcamento,
            **serializer.validated_data
        )

        return Response(
            ItemOrcamentoSerializer(item).data,
            status=201
        )

class PagamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamento
        exclude = ("orcamento",)
        read_only_fields = ("desconto_valor", "total")

    def create(self, validated_data):
        raise NotImplementedError(
            "Use o service criar_pagamento() para criar pagamentos."
        )


# =========================
# INTERFACE WEB (HTML)
# =========================

class OrcamentoDetailView(LoginRequiredMixin, DetailView):
    model = Orcamento
    template_name = "orcamentos/orcamento_detail.html"
    context_object_name = "orcamento"


@login_required
def gerar_pdf_orcamento(request, pk):
    orcamento = get_object_or_404(Orcamento, pk=pk)

    html_string = render_to_string(
        "orcamentos/orcamento_pdf.html",
        {"orcamento": orcamento}
    )

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="orcamento_{orcamento.numero_registro}.pdf"'
    )

    HTML(string=html_string).write_pdf(response)

    return response


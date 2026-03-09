from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import DetailView
from django.contrib.staticfiles import finders
from pathlib import Path


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework_simplejwt.authentication import JWTAuthentication

from weasyprint import HTML

from ..models import Orcamento, Pagamento
from .serializers import (
    OrcamentoSerializer,
    ItemOrcamentoSerializer,
    SimularOrcamentoSerializer,
)
from ..services.atomicidade import criar_item
from ..services.calculos import calcular_desconto, calcular_total, calcular_valor_item


# =========================
# API (JWT)
# =========================

class OrcamentoListCreateView(generics.ListCreateAPIView):
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Orcamento.objects.filter(usuario=self.request.user).order_by("-criado_em")


class OrcamentoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Orcamento.objects.filter(usuario=self.request.user)


class ItemCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        orcamento = get_object_or_404(Orcamento, pk=pk, usuario=request.user)

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


class OrcamentoSimularView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SimularOrcamentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantidade = serializer.validated_data["quantidade"]
        preco_unitario = serializer.validated_data["preco_unitario"]
        desconto_percentual = serializer.validated_data["desconto_percentual"]

        subtotal = calcular_valor_item(quantidade, preco_unitario)
        desconto_valor = calcular_desconto(subtotal, desconto_percentual)
        total = calcular_total(subtotal, desconto_valor)

        return Response(
            {
                "subtotal": subtotal,
                "desconto_percentual": desconto_percentual,
                "desconto_valor": desconto_valor,
                "total": total,
            },
            status=200,
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

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer

class OrcamentoDetailView(LoginRequiredMixin, DetailView):
    model = Orcamento
    template_name = "orcamentos/orcamento_detail.html"
    context_object_name = "orcamento"

    def get_queryset(self):
        return Orcamento.objects.filter(usuario=self.request.user)


@api_view(["GET"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def gerar_pdf_orcamento(request, pk):
    orcamento = get_object_or_404(Orcamento, pk=pk, usuario=request.user)

    css_path = finders.find("orcamentos/css/style.css")
    logo_path = finders.find("orcamentos/img/logo-atelie.svg")

    html_string = render_to_string(
        "orcamentos/orcamento_pdf.html",
        {
            "orcamento": orcamento,
            "pdf_css_uri": Path(css_path).as_uri() if css_path else "",
            "pdf_logo_uri": Path(logo_path).as_uri() if logo_path else "",
        },
    )

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="orcamento_{orcamento.numero_registro}.pdf"'
    )

    HTML(
        string=html_string,
        base_url=request.build_absolute_uri("/")
    ).write_pdf(response)

    return response

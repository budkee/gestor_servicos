from django.contrib import admin
from .models import Cliente, Orcamento, ItemOrcamento, Pagamento


class ItemOrcamentoInline(admin.TabularInline):
    model = ItemOrcamento
    extra = 1


class PagamentoInline(admin.StackedInline):
    model = Pagamento
    extra = 0


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nome", "cpf_cnpj", "celular", "email")
    search_fields = ("nome", "cpf_cnpj")


@admin.register(Orcamento)
class OrcamentoAdmin(admin.ModelAdmin):
    list_display = ("numero_registro", "cliente", "tipo_servico", "criado_em")
    search_fields = ("numero_registro", "cliente__nome")
    list_filter = ("tipo_servico", "criado_em")
    inlines = [ItemOrcamentoInline, PagamentoInline]


@admin.register(ItemOrcamento)
class ItemOrcamentoAdmin(admin.ModelAdmin):
    list_display = ("descricao", "orcamento", "quantidade", "preco_unitario", "valor")


@admin.register(Pagamento)
class PagamentoAdmin(admin.ModelAdmin):
    list_display = ("orcamento", "forma_pagamento", "subtotal", "desconto_percentual", "total")


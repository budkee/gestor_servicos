from django.urls import path
from .views import (
    OrcamentoListCreateView,
    OrcamentoRetrieveUpdateDestroyView,
    OrcamentoSimularView,
    OrcamentoDetailView,
    gerar_pdf_orcamento,
    ItemCreateView
)


urlpatterns = [

    # =====================
    # API
    # =====================
    path(
        "api/", 
        OrcamentoListCreateView.as_view(), 
        name="orcamento-list"
    ),
    path(
        "api/<int:pk>/",
        OrcamentoRetrieveUpdateDestroyView.as_view(), 
        name="orcamento-api-detail"
    ),
    path(
        "api/<int:pk>/itens/",
        ItemCreateView.as_view(), 
        name="item-create"
    ),
    path(
        "api/simular/",
        OrcamentoSimularView.as_view(),
        name="orcamento-simular"
    ),

    # =====================
    # INTERFACE WEB
    # =====================
    path(
        "<int:pk>/", 
        OrcamentoDetailView.as_view(), 
        name="orcamento-detail"
    ),
    path(
        "<int:pk>/pdf/",
        gerar_pdf_orcamento, 
        name="orcamento-pdf"
    ),
]

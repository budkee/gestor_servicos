from django.urls import path
from .views import (
    OrcamentoListCreateView,
    OrcamentoRetrieveView,
    OrcamentoDetailView,
    gerar_pdf_orcamento,
    ItemCreateView
)


urlpatterns = [

    # =====================
    # API
    # =====================
    path("", OrcamentoListCreateView.as_view(), name="orcamento-list"),
    path("api/<int:pk>/", OrcamentoRetrieveView.as_view(), name="orcamento-api-detail"),
    path("api/<int:pk>/itens/", ItemCreateView.as_view(), name="item-create"),

    # =====================
    # INTERFACE WEB
    # =====================
    path("<int:pk>/", OrcamentoDetailView.as_view(), name="orcamento-detail"),
    path("<int:pk>/pdf/", gerar_pdf_orcamento, name="orcamento-pdf"),
]

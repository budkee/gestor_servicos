from django.urls import path
from .views import (
    OrcamentoListCreateView,
    OrcamentoRetrieveUpdateDestroyView,
    OrcamentoSimularView,
    OrcamentoDetailView,
    gerar_pdf_orcamento,
    ItemCreateView,
)
from rest_framework_simplejwt.views import TokenObtainPairView


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
    path(
        "token/", 
        TokenObtainPairView.as_view(), 
        name="token_obtain_pair"
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
    path(
        "auth/register/", 
         RegisterView.as_view()
    ),

]

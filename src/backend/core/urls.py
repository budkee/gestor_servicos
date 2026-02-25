from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .auth_api import RegisterView, PasswordResetView, PasswordResetConfirmView

urlpatterns = [
    # =====================
    # Django Admin e Auth
    # =====================
    path(
        'admin/', 
        admin.site.urls
    ),
    path(
        "accounts/", 
        include("django.contrib.auth.urls")
    ),
    path(
        "token/", 
        TokenObtainPairView.as_view(), 
        name="token_obtain_pair"
    ),
    path(
        "token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    path(
        "auth/register/",
        RegisterView.as_view(),
        name="auth-register",
    ),
    path(
        "auth/password-reset/",
        PasswordResetView.as_view(),
        name="auth-password-reset",
    ),
    path(
        "auth/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    
    # =====================
    # API de Orçamentos   
    # =====================
    path(
        "orcamentos/", 
        include("apps.orcamentos.api.urls")
    ),
]

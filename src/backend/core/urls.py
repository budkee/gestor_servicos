from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Django
    path('admin/', admin.site.urls),

    # Login padrão Django
    path("accounts/", include("django.contrib.auth.urls")),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # App
    path("api/orcamentos/", include("apps.orcamentos.api.urls")),
]


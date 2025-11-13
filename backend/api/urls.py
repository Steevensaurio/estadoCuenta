from django.urls import path
from .views import obtener_cxc_aromotor


urlpatterns = [
    path('obtener-cxc/', obtener_cxc_aromotor),
]
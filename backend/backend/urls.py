from django.contrib import admin
from django.urls import path
from api.views import datos, obtener_datos_clientes, obtener_apuntes_contables, obtener_cxc,filtros


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/datos/', datos),
    path('api/facturas/', obtener_datos_clientes),
    path('api/apuntes/', obtener_apuntes_contables),
    path('api/cxc/', obtener_cxc),
    path('filtros/', filtros),
]

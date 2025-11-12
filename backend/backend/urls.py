from django.contrib import admin
from django.urls import path, include
from api.views import datos, obtener_apuntes_contables, obtener_cxc,filtros


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/datos/', datos),
    path('api/apuntes/', obtener_apuntes_contables),
    path('api/cxc/', obtener_cxc),
    path('api/prueba/', filtros),
    path('filtros/', filtros),
    path('api/', include('api.urls')),
]

from django.urls import path
from .views import ObtenerCXCView, filtros


urlpatterns = [
    path('obtener-cxc/', ObtenerCXCView.as_view(), name='obtener_cxc'),
    path('obtener-cxc/<str:cliente>/', ObtenerCXCView.as_view(), name='obtener_cxc_con_filtro'), 
]
from django.contrib import admin
from django.urls import path, include # <--- Agrega include
# Importamos tus vistas
from core.views import (
    dashboard, ingreso_algas, api_guardar_produccion, ingreso_aves, api_guardar_aves,
    exportar_algas_csv, exportar_granja_csv, menu_trabajador,
    panel_gerencia, crear_usuario, crear_producto, crear_lote # <--- NUEVOS
)
urlpatterns = [
    path('admin/', admin.site.urls),
    
    # RUTAS DEL SISTEMA DE SEGURIDAD (Login/Logout)
    path('accounts/', include('django.contrib.auth.urls')), 
    
    # TUS RUTAS
    path('', dashboard, name='dashboard'),
    path('produccion/', ingreso_algas, name='ingreso_algas'),
    path('api/guardar-produccion/', api_guardar_produccion, name='api_guardar_prod'),
    path('granja/', ingreso_aves, name='ingreso_aves'),
    path('api/guardar-granja/', api_guardar_aves, name='api_guardar_aves'),
    path('exportar/algas/', exportar_algas_csv, name='exportar_algas'),
    path('exportar/granja/', exportar_granja_csv, name='exportar_granja'),
    path('menu-trabajador/', menu_trabajador, name='menu_trabajador'),
    path('gerencia/', panel_gerencia, name='panel_gerencia'),
    path('gerencia/nuevo-usuario/', crear_usuario, name='crear_usuario'),
    path('gerencia/nuevo-producto/', crear_producto, name='crear_producto'),
    path('gerencia/nuevo-lote/', crear_lote, name='crear_lote'),
]
from django.contrib import admin
# Importamos las clases que creamos en models.py
from .models import Producto, ReporteProduccion, LoteAves, ReporteDiarioAves

# Registramos las clases para que aparezcan en el panel
# Puedes personalizar cómo se ven, pero por ahora usaremos la forma básica
admin.site.register(Producto)
admin.site.register(ReporteProduccion)
admin.site.register(LoteAves)
admin.site.register(ReporteDiarioAves)
# PERSONALIZACIÓN DEL ADMIN
admin.site.site_header = "Panel de Control - Algas Biotech" # Texto en la barra azul superior
admin.site.site_title = "Admin AlgasBio" # Texto en la pestaña del navegador
admin.site.index_title = "Bienvenido al Sistema de Gestión" # Texto principal en la home del admin
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator # <--- IMPORTANTE: Importamos el validador

# ==========================================
# SECCIÓN 1: ALGAS E INVENTARIO (Producción)
# ==========================================

class Producto(models.Model):
    """
    Define el catálogo de productos que la empresa maneja.
    """
    CATEGORIAS = [
        ('MP_ALGA_ENTERA', 'Materia Prima: Alga Entera'),
        ('MP_ALGA_DESHIDRATADA', 'Materia Prima: Alga Deshidratada'),
        ('MP_ALGA_MICRONIZADA', 'Materia Prima: Alga Micronizada'),
        ('PT_ALIMENTO', 'Producto Terminado: Alimento Animal'),
        ('PT_BIOESTIMULANTE', 'Producto Terminado: Bioestimulante'),
    ]

    nombre = models.CharField(max_length=100, help_text="Ej: Saco Alimento Gallina 20kg")
    categoria = models.CharField(max_length=30, choices=CATEGORIAS)
    
    # Stock actual: No puede ser negativo
    stock_actual = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        help_text="Cantidad en Kilos o Litros",
        validators=[MinValueValidator(0)] # <--- CANDADO DE SEGURIDAD
    )
    
    # Capacidad Instalada: No puede ser negativa
    capacidad_maxima_diaria = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Capacidad instalada diaria (Kg/L)",
        validators=[MinValueValidator(0)] # <--- CANDADO DE SEGURIDAD
    )

    def __str__(self):
        return f"{self.nombre} ({self.get_categoria_display()})"


class ReporteProduccion(models.Model):
    """
    Aquí llegan los datos de los trabajadores del mar o de la fábrica.
    """
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    
    # Cantidad producida: No puede ser negativa
    cantidad_producida = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Kilos o Litros producidos",
        validators=[MinValueValidator(0)] # <--- CANDADO DE SEGURIDAD
    )
    
    # IMPORTANTE PARA OFFLINE:
    fecha_registro = models.DateField(default=timezone.now) 
    created_at = models.DateTimeField(auto_now_add=True)
    
    responsable = models.CharField(max_length=100, help_text="Nombre del trabajador")

    def __str__(self):
        return f"{self.fecha_registro} - {self.producto.nombre}: {self.cantidad_producida}"

# ==========================================
# SECCIÓN 2: GALLINAS (Comparación y Pruebas)
# ==========================================

class LoteAves(models.Model):
    """
    Define un grupo de gallinas para poder compararlas.
    """
    DIETAS = [
        ('ALGAS', 'Experimental (Base Algas)'),
        ('CONTROL', 'Control (Alimento Normal)'),
    ]
    
    nombre = models.CharField(max_length=50, help_text="Ej: Nave 1 - Lote Experimental")
    tipo_dieta = models.CharField(max_length=10, choices=DIETAS)
    
    cantidad_aves_inicial = models.PositiveIntegerField(
        help_text="Cuántas gallinas iniciaron"
        # PositiveIntegerField ya impide negativos por defecto
    )
    
    fecha_inicio = models.DateField()
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} - {self.get_tipo_dieta_display()}"


class ReporteDiarioAves(models.Model):
    """
    Reporte diario de postura y consumo.
    """
    lote = models.ForeignKey(LoteAves, on_delete=models.CASCADE)
    
    # Datos del día
    fecha_reporte = models.DateField(default=timezone.now)
    
    huevos_recolectados = models.PositiveIntegerField() # Impide negativos
    huevos_rotos = models.PositiveIntegerField(default=0) # Impide negativos
    
    alimento_consumido_kg = models.DecimalField(
        max_digits=6, 
        decimal_places=2,
        validators=[MinValueValidator(0)] # <--- CANDADO DE SEGURIDAD
    )
    
    mortalidad = models.PositiveIntegerField(default=0, help_text="Gallinas muertas hoy")
    
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def tasa_postura(self):
        if self.lote.cantidad_aves_inicial > 0:
            return (self.huevos_recolectados / self.lote.cantidad_aves_inicial) * 100
        return 0

    def __str__(self):
        return f"{self.fecha_reporte} - {self.lote.nombre}"
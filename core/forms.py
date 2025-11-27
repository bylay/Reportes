from django import forms
from django.contrib.auth.models import User
from .models import Producto, LoteAves

# 1. Formulario para Crear Usuarios (Trabajadores)
class NuevoUsuarioForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, label="Contraseña")
    nombre = forms.CharField(max_length=100, label="Nombre Completo", required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        labels = {'username': 'Usuario (Login)', 'email': 'Correo Electrónico'}

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password"])
        user.first_name = self.cleaned_data["nombre"]
        if commit:
            user.save()
        return user

# 2. Formulario para Productos
class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = ['nombre', 'categoria', 'stock_actual', 'capacidad_maxima_diaria']
        widgets = {
            'categoria': forms.Select(attrs={'class': 'form-select'}),
        }

# 3. Formulario para Lotes de Aves
class LoteForm(forms.ModelForm):
    class Meta:
        model = LoteAves
        fields = ['nombre', 'tipo_dieta', 'cantidad_aves_inicial', 'fecha_inicio']
        widgets = {
            'fecha_inicio': forms.DateInput(attrs={'type': 'date'}),
            'tipo_dieta': forms.Select(attrs={'class': 'form-select'}),
        }
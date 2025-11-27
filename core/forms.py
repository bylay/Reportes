from django import forms
from django.contrib.auth.models import User
from .models import Producto, LoteAves

# 1. Formulario para Crear/Editar Usuarios
class NuevoUsuarioForm(forms.ModelForm):
    # Campo de correo obligatorio y validado
    email = forms.EmailField(required=True, label="Correo Electrónico")
    nombre = forms.CharField(max_length=100, label="Nombre Completo", required=True)
    password = forms.CharField(widget=forms.PasswordInput, label="Contraseña", required=False) # No requerida al editar

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        labels = {'username': 'Usuario (Login)'}

    def clean_email(self):
        # Validar que el correo no lo tenga otra persona
        email = self.cleaned_data.get('email')
        username = self.cleaned_data.get('username')
        
        # Si existe un usuario con ese email PERO no es el mismo usuario que estamos editando
        if email and User.objects.filter(email=email).exclude(username=username).exists():
            raise forms.ValidationError("Este correo ya está registrado por otro usuario.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        # Solo cambiamos contraseña si escribieron algo nuevo
        if self.cleaned_data.get("password"):
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
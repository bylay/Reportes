document.addEventListener('DOMContentLoaded', () => {
    
    // Identificamos formularios
    const formProduccion = document.getElementById('form-produccion');
    const formGranja = document.getElementById('form-granja');
    const statusBar = document.getElementById('status-bar');

    // 1. Verificar estado inicial
    actualizarEstado();
    window.addEventListener('online', actualizarEstado);
    window.addEventListener('offline', actualizarEstado);

    // --- LÓGICA ALGAS ---
    if(formProduccion) {
        formProduccion.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formProduccion.querySelector('button[type="submit"]');
            
            // Recolectar datos
            const datos = {
                tipo: 'ALGAS',
                url_api: '/api/guardar-produccion/',
                producto_id: document.getElementById('producto').value,
                cantidad: document.getElementById('cantidad').value,
                responsable: document.getElementById('responsable').value,
                fecha_registro: new Date().toISOString().split('T')[0],
                temp_id: Date.now()
            };
            
            await procesarEnvio(datos, formProduccion, btn);
        });
    }

    // --- LÓGICA GRANJA ---
    if(formGranja) {
        formGranja.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = formGranja.querySelector('button[type="submit"]');

            const datos = {
                tipo: 'GRANJA',
                url_api: '/api/guardar-granja/',
                lote_id: document.getElementById('lote').value,
                huevos: document.getElementById('huevos').value,
                alimento: document.getElementById('alimento').value,
                mortalidad: document.getElementById('mortalidad').value,
                responsable: document.getElementById('responsable').value,
                fecha_registro: new Date().toISOString().split('T')[0],
                temp_id: Date.now()
            };
            
            await procesarEnvio(datos, formGranja, btn);
        });
    }

    // --- FUNCIONES CORE ---

    async function procesarEnvio(datos, formulario, btn) {
        // 1. EFECTO DE CARGA (UX PRO)
        const textoOriginal = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        try {
            if (navigator.onLine) {
                await enviarAlServidor(datos);
            } else {
                guardarOffline(datos);
            }
            formulario.reset(); // Limpiar campos
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Hubo un problema inesperado', 'error');
        } finally {
            // Restaurar botón
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
        }
    }

    async function enviarAlServidor(datos) {
        try {
            const respuesta = await fetch(datos.url_api, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json();
            
            if (resultado.status === 'ok') {
                // ALERTA PRO
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'Datos sincronizados con la central.',
                    timer: 2000,
                    showConfirmButton: false
                });
                return true;
            } else {
                Swal.fire('Error', resultado.mensaje, 'error');
                return false;
            }
        } catch (error) {
            console.error("Fallo red, guardando offline...");
            guardarOffline(datos);
            return false;
        }
    }

    function guardarOffline(datos) {
        let pendientes = JSON.parse(localStorage.getItem('reportes_pendientes')) || [];
        pendientes.push(datos);
        localStorage.setItem('reportes_pendientes', JSON.stringify(pendientes));
        
        // ALERTA PRO AMARILLA
        Swal.fire({
            icon: 'warning',
            title: 'Sin Internet',
            text: 'Guardado en el celular. Se subirá cuando tengas señal.',
            confirmButtonColor: '#f39c12'
        });
    }

    async function intentarSincronizar() {
        let pendientes = JSON.parse(localStorage.getItem('reportes_pendientes')) || [];
        if (pendientes.length > 0) {
            // Toast notificación pequeña en la esquina (Muy elegante)
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            Toast.fire({ icon: 'info', title: 'Sincronizando datos...' });

            for (let i = pendientes.length - 1; i >= 0; i--) {
                const exito = await enviarAlServidorSilencioso(pendientes[i]); // Versión sin alertas
                if (exito) pendientes.splice(i, 1);
            }
            localStorage.setItem('reportes_pendientes', JSON.stringify(pendientes));
            
            if (pendientes.length === 0) {
                Toast.fire({ icon: 'success', title: '¡Sincronización Completa!' });
            }
        }
    }
    
    // Versión especial para sincronización masiva (sin popups molestos por cada uno)
    async function enviarAlServidorSilencioso(datos) {
        try {
            const r = await fetch(datos.url_api, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return (await r.json()).status === 'ok';
        } catch { return false; }
    }

    function actualizarEstado() {
        if (navigator.onLine) {
            statusBar.innerHTML = '<i class="fa-solid fa-wifi"></i> Conectado';
            statusBar.className = "alert alert-success shadow-sm"; // Usamos clases de Bootstrap
            statusBar.style.display = 'block';
            intentarSincronizar();
        } else {
            statusBar.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Modo Offline';
            statusBar.className = "alert alert-warning shadow-sm";
            statusBar.style.display = 'block';
        }
    }
});
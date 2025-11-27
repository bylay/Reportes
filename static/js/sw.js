const CACHE_NAME = 'algas-erp-v4'; // Cambiamos versión para forzar actualización

// La "Maleta" de archivos que nos llevamos al mar
const ASSETS_TO_CACHE = [
    // 1. Las Páginas (HTML)
    '/produccion/',
    '/granja/',
    '/menu-trabajador/',
    
    // 2. Nuestros archivos locales
    '/static/js/app.js',
    '/static/manifest.json',

    // 3. Librerías Externas (Bootstrap, Iconos, Alertas)
    // Es vital guardar esto, si no la app se verá fea y rota offline
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// 1. INSTALACIÓN: Abrimos la maleta y guardamos todo
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando y guardando caché...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Forza al SW a activarse de inmediato
});

// 2. ACTIVACIÓN: Limpiamos maletas viejas (versiones anteriores)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Borrando caché vieja:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim(); // Toma control de todas las pestañas abiertas
});

// 3. INTERCEPTOR: Cuando el navegador pide una página
self.addEventListener('fetch', (event) => {
    
    // Estrategia: "Cache First, falling back to Network"
    // (Primero busca en la mochila, si no está, intenta internet)
    
    // Solo interceptamos peticiones GET (ver cosas), no POST (enviar datos)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // ¡Encontrado en la mochila! Lo entregamos rápido.
                return cachedResponse;
            }
            // No está en la mochila, intentamos bajarlo de internet
            return fetch(event.request).catch(() => {
                // Si falla internet y no está en caché...
                // Aquí podrías mostrar una página de "Estás offline" genérica si quisieras
                console.log("Fallo de red y no está en caché:", event.request.url);
            });
        })
    );
});
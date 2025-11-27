const CACHE_NAME = 'algas-app-v1';
const ASSETS_TO_CACHE = [
    '/produccion/',  // La página de algas
    '/granja/',      // La página de granja
    '/static/js/app.js', // Tu lógica
    '/static/manifest.json'
    // Si tuvieras un archivo .css externo, iría aquí
];

// 1. INSTALACIÓN: Descargamos las páginas para tenerlas guardadas
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando caché...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVACIÓN: Limpiamos cachés viejas si actualizas la app
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. INTERCEPTOR (FETCH): Cuando el usuario pide una página
self.addEventListener('fetch', (event) => {
    // Solo interceptamos peticiones GET (ver páginas), no los POST (enviar datos)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si hay internet, devolvemos la página fresca y actualizamos la caché
                // (Estrategia: Network First, falling back to cache)
                const clon = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clon);
                });
                return response;
            })
            .catch(() => {
                // SI NO HAY INTERNET: Buscamos en la caja fuerte
                return caches.match(event.request);
            })
    );
});
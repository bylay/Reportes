const CACHE_NAME = 'algas-erp-v5'; // Subimos versión

// ARCHIVOS CRÍTICOS QUE DEBEN ESTAR SIEMPRE
const STATIC_ASSETS = [
    '/static/js/app.js',
    '/static/manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// PÁGINAS QUE QUEREMOS QUE FUNCIONEN OFFLINE
const PAGES_TO_CACHE = [
    '/menu-trabajador/',
    '/produccion/',
    '/granja/'
];

// 1. INSTALACIÓN: Guardamos todo en la mochila
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando v5...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Guardamos estáticos y páginas
            return cache.addAll([...STATIC_ASSETS, ...PAGES_TO_CACHE]);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVACIÓN: Limpieza
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
    self.clients.claim();
});

// 3. INTERCEPTOR (LA MAGIA ESTÁ AQUÍ)
self.addEventListener('fetch', (event) => {
    
    // Solo nos importan las peticiones GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            // A) INTENTAR RED (Network First)
            // Tratamos de ir a internet primero para tener datos frescos
            try {
                const networkResponse = await fetch(event.request);
                
                // Si la respuesta es válida, actualizamos la copia en caché para la próxima
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    cache.put(event.request, networkResponse.clone());
                }
                
                return networkResponse;

            } catch (error) {
                // B) FALLÓ INTERNET (Estamos Offline)
                console.log('Offline detectado. Buscando en caché:', event.request.url);

                // 1. Buscamos si tenemos el archivo exacto guardado
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // 2. ESTRATEGIA FALLBACK (PLAN B)
                // Si el usuario quería entrar a una página (HTML) y no la tenemos (ej: el Home),
                // le mostramos el Menú de Trabajador que SÍ tenemos guardado.
                if (event.request.mode === 'navigate') {
                    return cache.match('/menu-trabajador/');
                }

                return null;
            }
        })()
    );
});
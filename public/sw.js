// SINERGI PWA Service Worker — Security-Hardened Cache Controller
const CACHE_VERSION = 'sinergi-cache-v2';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    '/offline.html',
];

// Paths that must NEVER be cached by Service Worker to prevent sensitive data leakage
const PROTECTED_ROUTE_REGEX = /^\/(portal|eskul|kas|admin|workspace|password|attendance|api)(\/|$)/;

// Install Event — Pre-cache static public shell and offline fallback
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event — Aggressively purge deprecated or obsolete caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_VERSION) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-http(s)
    if (!event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);
    const isProtected = PROTECTED_ROUTE_REGEX.test(url.pathname);
    const isInertia = event.request.headers.get('X-Inertia') !== null;

    // RULE 1: STRICT NETWORK-ONLY for authenticated/protected endpoints and Inertia data requests.
    // Private student records, financial ledgers, and audit logs must NEVER be stored in CacheStorage.
    if (isProtected || isInertia) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // If offline during navigation, serve the generic offline fallback page
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                return new Response(JSON.stringify({ error: 'Offline', message: 'Koneksi internet diperlukan.' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );
        return;
    }

    // RULE 2: CACHE-FIRST for hashed immutable static assets (/build/assets/...)
    if (url.pathname.startsWith('/build/assets/')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // RULE 3: NETWORK-FIRST for public landing pages (/ or /login) with offline fallback
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    // Only cache public pages, never cache redirects or authenticated states
                    const clone = networkResponse.clone();
                    caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    return cached || caches.match('/offline.html');
                });
            })
    );
});

// Message Event — Support manual cache clearing upon logout
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_USER_DATA') {
        caches.keys().then((keys) => {
            keys.forEach((key) => {
                if (key.includes('user') || key.includes('data')) {
                    caches.delete(key);
                }
            });
        });
    }
});

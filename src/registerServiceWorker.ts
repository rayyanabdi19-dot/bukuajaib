/**
 * Service Worker Registration for Buku Ajaib PWA
 * Configured with Stale-While-Revalidate caching strategy
 */

export function initServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      // Dynamic import to support vite-plugin-pwa virtual register if available
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            console.log('[PWA] Versi baru tersedia, siap dimuat ulang.');
            // Dispatch a custom event so the UI can prompt or auto-update if desired
            window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: { updateSW } }));
          },
          onOfflineReady() {
            console.log('[PWA] Cache statis & offline siap digunakan (Stale-While-Revalidate).');
            window.dispatchEvent(new CustomEvent('pwa-offline-ready'));
          },
        });
        return;
      } catch {
        // Fallback to standard service worker registration
      }

      // Standard Service Worker fallback registration
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] ServiceWorker standard registered with scope:', registration.scope);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Konten baru tersedia. Stale-While-Revalidate aktif.');
            }
          });
        }
      });
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  });
}

import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS specific meta tags for PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="FHServicios" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />

        {/* Theme color for address bar */}
        <meta name="theme-color" content="#2A3B76" />
        <meta name="msapplication-navbutton-color" content="#2A3B76" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Bootstrap the service worker. */}
        <script dangerouslySetInnerHTML={{ __html: sw }} />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
        {/* Executive typography — Inter font family */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `
          *, *::before, *::after { box-sizing: border-box; }
          body, html {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-feature-settings: 'cv02','cv03','cv04','cv11';
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #1a1f36;
            background: #f0f4f8;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #1a1f36;
          }
          p, span, div, td, th, label, input, button, a {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
          }
          /* Scrollbar global */
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f0f4f8; }
          ::-webkit-scrollbar-thumb { background: #c5cdd8; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
          /* Remove default button styling */
          button { font-family: 'Inter', sans-serif !important; }
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const sw = `
// Service worker desactivado: desregistra SW y limpia caché en cada visita
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(r => r.unregister());
    });
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
}
`;

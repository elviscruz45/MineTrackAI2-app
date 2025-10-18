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
        <meta name="apple-mobile-web-app-title" content="ConfiPetrolAI" />
        <link rel="apple-touch-icon" href="/confipetrol.png" />

        {/* Theme color for address bar */}
        <meta name="theme-color" content="#2A3B76" />
        <meta name="msapplication-navbutton-color" content="#2A3B76" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* Bootstrap the service worker. */}
        <script dangerouslySetInnerHTML={{ __html: sw }} />

        {/* Icon Fonts - CRITICAL: Must be loaded from /fonts/ not node_modules */}
        <style dangerouslySetInnerHTML={{ __html: iconFonts }} />
        
        {/* Preload icon fonts for faster loading */}
        <link rel="preload" href="/fonts/Ionicons.6148e7019854f3bde85b633cb88f3c25.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Feather.a76d309774d33d9856f650bed4292a23.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const iconFonts = `
  @font-face {
    font-family: 'Ionicons';
    src: url('/fonts/Ionicons.6148e7019854f3bde85b633cb88f3c25.ttf') format('truetype');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'MaterialIcons';
    src: url('/fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'MaterialCommunityIcons';
    src: url('/fonts/MaterialCommunityIcons.b62641afc9ab487008e996a5c5865e56.ttf') format('truetype');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Feather';
    src: url('/fonts/Feather.a76d309774d33d9856f650bed4292a23.ttf') format('truetype');
    font-display: swap;
    font-weight: normal;
    font-style: normal;
  }
`;

const sw = `
if ('serviceWorker' in navigator) {
    let refreshing = false;
    
    // Listen for controlling service worker change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });
    
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute
            
            // Listen for waiting service worker
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New version available
                            console.log('New version available');
                            
                            // Show update notification
                            showUpdateNotification(newWorker);
                        } else {
                            // First install
                            console.log('Content cached for offline use');
                        }
                    }
                });
            });
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
    });
    
    function showUpdateNotification(worker) {
        // Create update notification
        const updateBanner = document.createElement('div');
        updateBanner.id = 'update-banner';
        updateBanner.style.cssText = \`
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #2A3B76;
            color: white;
            padding: 12px 20px;
            text-align: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        \`;
        
        updateBanner.innerHTML = \`
            <span>🚀 Nueva versión disponible!</span>
            <button id="update-btn" style="
                background: white;
                color: #2A3B76;
                border: none;
                padding: 6px 12px;
                margin-left: 10px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
            ">Actualizar</button>
            <button id="dismiss-btn" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 6px 12px;
                margin-left: 8px;
                border-radius: 4px;
                cursor: pointer;
            ">Después</button>
        \`;
        
        document.body.appendChild(updateBanner);
        
        // Handle update button click
        document.getElementById('update-btn').addEventListener('click', () => {
            worker.postMessage({ type: 'SKIP_WAITING' });
            updateBanner.remove();
        });
        
        // Handle dismiss button click
        document.getElementById('dismiss-btn').addEventListener('click', () => {
            updateBanner.remove();
        });
    }
}
`;

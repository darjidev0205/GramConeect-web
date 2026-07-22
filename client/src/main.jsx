import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { testBackendConnection } from './services/api';

// Temporary safe cleanup for any lingering or stale mobile PWA service workers
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  }).catch((err) => console.warn('Service worker unregister failed:', err));
}

// Run backend connection diagnostic in development mode
if (import.meta.env.DEV) {
  testBackendConnection().catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

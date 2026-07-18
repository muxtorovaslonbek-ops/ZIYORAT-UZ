import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker — auto-updates in background
registerSW({
  onNeedRefresh() {
    // Silent auto-refresh
  },
  onOfflineReady() {
    console.info('[PWA] Offline ready!');
  },
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

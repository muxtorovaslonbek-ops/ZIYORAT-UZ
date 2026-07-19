import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// PORT faqat dev/serve vaqtida kerak, build vaqtida emas
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: "ZIYORAT UZ — Oʻzbekiston ziyorat turizmi",
        short_name: "ZIYORAT UZ",
        description: "Oʻzbekiston ziyoratgohlari, gidlar va 3D sayohat — premium ziyorat turizm ilovasi.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0a0a",
        theme_color: "#C9A84C",
        lang: "uz",
        categories: ["travel", "lifestyle"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        shortcuts: [
          { name: "AI Yo'lboshchi", short_name: "AI", url: "/ai-yolboshchi", description: "AI bilan suhbatlashing" },
          { name: "Ziyoratgohlar", short_name: "Ziyorat", url: "/ziyoratgohlar", description: "Muqaddas joylar" },
          { name: "Milliy Market", short_name: "Market", url: "/milliy-market", description: "Mahalliy mahsulotlar" },
        ],
        screenshots: [
          { src: "/opengraph.jpg", sizes: "1200x630", type: "image/jpeg", form_factor: "wide" as any },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst' as const,
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate' as const,
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 31_536_000 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/market\/.*\.(jpg|png|webp)$/,
            handler: 'CacheFirst' as const,
            options: {
              cacheName: 'market-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 86_400 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: { overlay: false },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

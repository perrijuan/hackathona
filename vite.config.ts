import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa"; // 1. Importe o plugin

// https://vite.dev/config/
export default defineConfig({
  // 2. Adicione o VitePWA à sua lista de plugins
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Vector – Mobilidade Veicular Estudantil",
        short_name: "Vector",
        description:
          "Vector é um aplicativo de carona para estudantes: rápido, seguro e econômico.",
        start_url: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#000000",
        theme_color: "#FF6B00",
        scope: "/",
        icons: [
          {
            src: "/icone.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icone.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icone.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  base: "./",
});

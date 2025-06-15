import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Punto de entrada principal
  format: ["esm", "cjs", "iife"], // Modos: ESM, CommonJS y IIFE (CDN)
  globalName: "Brex", // Nombre global para el bundle iife
  dts: true, // Generar archivos de tipo .d.ts
  sourcemap: true,
  clean: true, // Limpia `dist/` antes de generar
  target: "es2021", // Define la versión JS
  outDir: "dist", // Carpeta de salida
});

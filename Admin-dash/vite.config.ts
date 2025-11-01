import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
    // this ensures React Router routes work in dev
    fs: {
      allow: ["."],
    },
  },
  build: {
    rollupOptions: {
      // fallback for client-side routing
      output: {
        manualChunks: undefined,
      },
    },
  },
});

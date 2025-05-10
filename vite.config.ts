import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Exporting Vite config
export default defineConfig({
  root: "client",  // Root directory for your Vite app
  plugins: [react()],  // React plugin for Vite
  resolve: {
    alias: {
      // Define aliases for simplifying imports
      "@": path.resolve(__dirname, "./client/src"),  // Alias for src folder
      "@shared": path.resolve(__dirname, "shared"),  // Alias for shared folder
      "@assets": path.resolve(__dirname, "attached_assets"),  // Alias for assets folder
    },
  },
  build: {
    // Configuration for the build output
    outDir: "dist",  // The directory to output the build files
    emptyOutDir: true,  // Clear the output directory before building
    rollupOptions: {
      external: ['@tanstack/react-query'],  // Externalize @tanstack/react-query if necessary
      // Add any additional externalized modules if required.
    },
  },
  server: {
    // Configure server options
    open: true,  // Open browser after server start
    port: 3000,  // Port to run Vite dev server
    proxy: {
      // Optional: Proxy API calls to backend
      "/api": "http://localhost:5000",
    },
  },
});

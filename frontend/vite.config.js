import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@contexts": path.resolve(__dirname, "./src/contexts"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@styles": path.resolve(__dirname, "./src/styles"),
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    server: {
      port: 5173,
      strictPort: false,
      open: false,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://127.0.0.1:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    css: {
      devSourcemap: true,
    },

    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild",
      target: "es2020",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react-dom")) return "react-vendor";
            if (id.includes("node_modules/react/")) return "react-vendor";
            if (id.includes("node_modules/react-router")) return "router";
            if (id.includes("node_modules/@supabase")) return "supabase";
            if (id.includes("node_modules/axios")) return "axios";
          },
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },
    },

    preview: {
      port: 4173,
    },
  };
});

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL(".", import.meta.url).pathname, "");
  const arServerUrl = env.VITE_AR_SERVER_URL?.trim();

  return {
    root: new URL("src/renderer/src", import.meta.url).pathname,
    envDir: new URL(".", import.meta.url).pathname,
    publicDir: new URL("public", import.meta.url).pathname,
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        "@": new URL("src/renderer/src", import.meta.url).pathname,
      },
    },
    server: arServerUrl
      ? {
          proxy: {
            "/ar-server": {
              target: arServerUrl,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/ar-server/, ""),
            },
          },
        }
      : undefined,
  };
});

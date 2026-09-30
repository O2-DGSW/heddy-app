import { existsSync, readFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, new URL(".", import.meta.url).pathname, "");
  const useLocalHttps = command === "serve" && mode === "https";
  const certFile = new URL(".cert/localhost.pem", import.meta.url);
  const keyFile = new URL(".cert/localhost-key.pem", import.meta.url);
  if (useLocalHttps && (!existsSync(certFile) || !existsSync(keyFile))) {
    throw new Error("로컬 HTTPS 인증서가 없습니다. README의 설정 후 pnpm cert:dev를 실행하세요.");
  }
  const https = useLocalHttps
    ? { cert: readFileSync(certFile), key: readFileSync(keyFile) }
    : undefined;
  const arServerUrl = env.VITE_AR_SERVER_URL?.trim();
  const arServerProxy = arServerUrl
    ? {
        "/ar-server": {
          target: arServerUrl,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/ar-server/, ""),
        },
      }
    : undefined;

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
    server: { https, proxy: arServerProxy },
    preview: arServerProxy ? { proxy: arServerProxy } : undefined,
  };
});

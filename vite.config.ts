import { existsSync, readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { Agent } from "node:https";
import { checkServerIdentity } from "node:tls";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config
export default defineConfig(({ command, mode, isPreview }) => {
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
  const arServerCertPath = env.AR_SERVER_CERT_FILE?.trim();
  let arServerAgent: Agent | undefined;
  if (useLocalHttps && !isPreview && arServerUrl && arServerCertPath) {
    if (new URL(arServerUrl).protocol !== "https:") {
      throw new Error("AR 서버 인증서 설정은 HTTPS 서버 주소에서만 사용할 수 있습니다.");
    }
    const arServerCertFile = new URL(arServerCertPath, new URL(".", import.meta.url));
    if (!existsSync(arServerCertFile)) {
      throw new Error("AR_SERVER_CERT_FILE에 지정한 서버 인증서를 찾을 수 없습니다.");
    }
    const certificate = readFileSync(arServerCertFile);
    const expectedFingerprint = new X509Certificate(certificate).fingerprint256;
    // 개발용 AR 프록시에만 승인된 인증서를 고정하고, 호스트 이름과 TLS 검증을 유지한다.
    arServerAgent = new Agent({
      ca: certificate,
      rejectUnauthorized: true,
      checkServerIdentity: (hostname, peerCertificate) => {
        const identityError = checkServerIdentity(hostname, peerCertificate);
        if (identityError) return identityError;
        if (peerCertificate.fingerprint256 !== expectedFingerprint) {
          return new Error("AR 서버 인증서가 승인된 인증서와 다릅니다.");
        }
        return undefined;
      },
    });
  }
  const arServerProxy = arServerUrl
    ? {
        "/ar-server": {
          target: arServerUrl,
          changeOrigin: true,
          ...(arServerAgent && { agent: arServerAgent }),
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

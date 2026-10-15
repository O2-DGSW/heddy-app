import { existsSync, readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { Agent } from "node:https";
import { checkServerIdentity } from "node:tls";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { visualizer } from "rollup-plugin-visualizer";
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

  // 웹 배포는 heddy.site/mobile 하위 경로에서 서비스된다(heddy-landing이 프록시). Vercel에만
  // VITE_BASE_PATH=/mobile/ 을 넣고, 네이티브(Capacitor)·로컬 개발은 기본값 "/"를 쓴다.
  const base = env.VITE_BASE_PATH?.trim() || "/";

  return {
    base,
    root: new URL("src/renderer/src", import.meta.url).pathname,
    envDir: new URL(".", import.meta.url).pathname,
    publicDir: new URL("public", import.meta.url).pathname,
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      // pnpm build:analyze 일 때만 번들 구성 보고서를 만든다 (저장소 루트 bundle-stats.html)
      ...(process.env.ANALYZE === "true"
        ? [
            visualizer({
              filename: new URL("bundle-stats.html", import.meta.url).pathname,
              gzipSize: true,
              template: "treemap",
            }),
          ]
        : []),
    ],
    build: {
      rolldownOptions: {
        output: {
          // 자주 바뀌지 않는 라이브러리를 앱 코드와 분리해, 앱만 바뀌었을 때 캐시를 재사용한다
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              { name: "query", test: /node_modules[\\/]@tanstack[\\/]/ },
              { name: "capacitor", test: /node_modules[\\/](@capacitor|@capgo|capacitor-)/ },
              { name: "mediapipe", test: /node_modules[\\/]@mediapipe[\\/]/ },
              { name: "vendor", test: /node_modules[\\/]/ },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": new URL("src/renderer/src", import.meta.url).pathname,
      },
    },
    server: { https, proxy: arServerProxy },
    preview: arServerProxy ? { proxy: arServerProxy } : undefined,
  };
});

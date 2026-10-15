import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

// 앱과 같은 Vite 설정(@ 별칭, env)을 그대로 쓰고, 테스트 파일은 저장소 루트 기준으로 찾는다.
// React 컴포넌트 테스트는 파일 맨 위에 `// @vitest-environment jsdom`을 붙인다.
export default defineConfig(env =>
  mergeConfig(viteConfig(env), {
    test: {
      root: new URL(".", import.meta.url).pathname,
      include: [
        "tests/**/*.test.ts",
        "packages/**/*.test.ts",
        "src/renderer/src/**/*.test.{ts,tsx}",
      ],
      environment: "node",
      restoreMocks: true,
    },
  })
);

# React + TypeScript + Vite

## 로컬 HTTPS 개발

로컬 브라우저 개발 서버는 `mkcert`로 발급한 인증서를 사용해 HTTPS로 실행할 수 있습니다.
Vite의 [server.https](https://vite.dev/config/server-options#server-https) 설정을 사용합니다.

macOS에서 최초 설정:

```sh
brew install mkcert
mkcert -install
pnpm cert:dev
pnpm dev:https
```

`mkcert -install`은 로컬 인증기관을 시스템 신뢰 저장소에 등록하는 최초 설정입니다.
이미 설치·신뢰된 환경에서는 `pnpm cert:dev`부터 실행하면 됩니다.
다른 OS의 설치 방법은 [mkcert 공식 문서](https://github.com/FiloSottile/mkcert)를 참고하세요.

접속 주소는 `https://localhost:5174`입니다. `localhost`, `127.0.0.1`, `::1`용 인증서를
`.cert/`에 저장하며 인증서와 개인키는 Git에서 제외합니다. 인증서 갱신 시에는
`pnpm cert:dev` 실행 후 개발 서버를 재시작하세요.

이 명령은 브라우저 개발용입니다. `pnpm dev`와 Capacitor live reload는 기존 HTTP 방식을
사용합니다. 로컬 HTTPS 설정으로 원격 AR 서버의 인증서 신뢰 오류가 해결되지는 않습니다.
`VITE_AR_SERVER_URL`에는 유효한 인증서가 적용된 HTTPS 서버 주소가 필요합니다.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

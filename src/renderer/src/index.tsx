import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 전체 폰트(2MB) 대신 화면에 쓰인 글자가 속한 조각만 받는다. Vite가 경로에 base를 붙여 웹·앱 모두 동작한다.
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "../../main/global.css";
import App from "./app/App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient.ts";
import { setupApiAuth } from "./app/setupApiAuth.ts";

setupApiAuth();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../main/global.css";
import App from "./app/App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient.ts";

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

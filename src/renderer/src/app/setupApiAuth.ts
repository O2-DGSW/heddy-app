import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { clearAuthTokens, getAccessToken, refreshAuthTokens } from "@/entities/auth";
import { api, setAccessTokenGetter } from "@/shared/lib/api";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isInitialized = false;

const isAuthenticationRequest = (url: string | undefined) => url?.startsWith("/auth/") ?? false;

export const setupApiAuth = () => {
  if (isInitialized) {
    return;
  }

  isInitialized = true;
  setAccessTokenGetter(getAccessToken);

  api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        isAuthenticationRequest(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const tokens = await refreshAuthTokens();

        if (!tokens) {
          await clearAuthTokens();
          return Promise.reject(error);
        }

        originalRequest.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
        return api.request(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }
  );
};

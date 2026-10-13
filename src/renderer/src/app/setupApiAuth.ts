import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  isRefreshTokenRejectedError,
  refreshAuthTokens,
} from "@/entities/auth";
import { api, setAccessTokenGetter } from "@/shared/lib/api";

import { queryClient } from "./queryClient";
import { notifySessionExpired } from "./sessionExpiry";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isInitialized = false;

// 로그인·재발급·회원가입의 401은 토큰 만료가 아니라 요청 자체의 실패라 재발급하지 않는다.
// 로그아웃·탈퇴 재인증 같은 나머지 /auth/ 요청은 토큰이 만료됐으면 재발급 후 다시 보낸다.
const NO_REFRESH_PATHS = ["/auth/login/", "/auth/token/refresh", "/auth/signup/"];

const shouldSkipRefresh = (url: string | undefined) =>
  url ? NO_REFRESH_PATHS.some(path => url.startsWith(path)) : false;

const expireSession = async () => {
  await clearAuthTokens();
  queryClient.clear();
  notifySessionExpired();
};

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
        shouldSkipRefresh(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const tokens = await refreshAuthTokens();

        if (!tokens) {
          await expireSession();
          return Promise.reject(error);
        }

        originalRequest.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
        return api.request(originalRequest);
      } catch (refreshError) {
        // 네트워크 오류로 재발급을 못 한 경우는 토큰을 남겨두고 요청만 실패시킨다
        if (isRefreshTokenRejectedError(refreshError)) {
          await expireSession();
        }

        return Promise.reject(error);
      }
    }
  );
};

import axios, { isAxiosError } from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { ApiHttpError } from "./request.ts";
import type { ApiResponse } from "./types.ts";

/** 앱 서버(REST) 요청에 쓰는 클라이언트. 주소와 인증은 앱 시작 시 configureApiClient로 주입한다 */
export const apiClient = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export interface ApiClientAuth {
  getAccessToken: () => Promise<string | null>;
  /** 401을 받았을 때 새 access 토큰을 받아온다. 재발급할 수 없으면 null을 돌려준다 */
  refreshAccessToken: () => Promise<string | null>;
  /** true면 401이어도 재발급하지 않는다 (로그인·재발급 요청 자체 등) */
  shouldSkipRefresh?: (url: string | undefined) => boolean;
  /** true면 Authorization 헤더를 붙이지 않는다 (로그인 없이 보는 공개 API) */
  isPublicRequest?: (url: string | undefined) => boolean;
}

interface ApiClientConfig {
  baseURL?: string;
  auth: ApiClientAuth;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isConfigured = false;

export const configureApiClient = ({ baseURL, auth }: ApiClientConfig) => {
  if (isConfigured) {
    return;
  }

  isConfigured = true;
  apiClient.defaults.baseURL = baseURL;

  apiClient.interceptors.request.use(async config => {
    if (auth.isPublicRequest?.(config.url)) {
      return config;
    }

    const accessToken = await auth.getAccessToken();

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  });

  apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        auth.shouldSkipRefresh?.(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const accessToken = await auth.refreshAccessToken();

      if (!accessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return apiClient.request(originalRequest);
    }
  );
};

/**
 * HTTP 상태 코드. api 함수들이 사용자용 메시지로 감싸서 던지므로 cause까지 따라간다.
 * axios 에러와 @heddy/api의 ApiHttpError를 모두 다룬다.
 */
export const getHttpStatus = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof ApiHttpError) {
    return error.status;
  }

  if (error instanceof Error && error.cause) {
    return getHttpStatus(error.cause);
  }

  return undefined;
};

/** 서버가 내려준 오류 메시지. 없으면 fallbackMessage를 쓴다 */
export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.error?.message || error.response?.data?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

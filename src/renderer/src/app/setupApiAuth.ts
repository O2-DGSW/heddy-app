import { configureApiClient } from "@heddy/api";

import {
  clearAuthTokens,
  getAccessToken,
  isRefreshTokenRejectedError,
  refreshAuthTokens,
} from "@/entities/auth";
import { env } from "@/shared/config";

import { queryClient } from "./queryClient";
import { notifySessionExpired } from "./sessionExpiry";

// 로그인·재발급·회원가입의 401은 토큰 만료가 아니라 요청 자체의 실패라 재발급하지 않는다.
// 로그아웃·탈퇴 재인증 같은 나머지 /auth/ 요청은 토큰이 만료됐으면 재발급 후 다시 보낸다.
const NO_REFRESH_PATHS = ["/auth/login/", "/auth/token/refresh", "/auth/signup/"];

const shouldSkipRefresh = (url: string | undefined) =>
  url ? NO_REFRESH_PATHS.some(path => url.startsWith(path)) : false;

// 공개 API(/public/)는 로그인 없이 보는 화면용이라 토큰을 보내지 않는다.
const isPublicRequest = (url: string | undefined) => url?.startsWith("/public/") ?? false;

const expireSession = async () => {
  await clearAuthTokens();
  queryClient.clear();
  notifySessionExpired();
};

/** 401을 받으면 토큰을 재발급한다. 서버가 거부했을 때만 세션을 끝내고, 네트워크 오류면 토큰을 남긴다 */
const refreshAccessToken = async () => {
  try {
    const tokens = await refreshAuthTokens();

    if (!tokens) {
      await expireSession();
      return null;
    }

    return tokens.accessToken;
  } catch (error) {
    if (isRefreshTokenRejectedError(error)) {
      await expireSession();
    }

    return null;
  }
};

export const setupApiAuth = () => {
  configureApiClient({
    baseURL: env.apiBaseUrl,
    auth: { getAccessToken, refreshAccessToken, shouldSkipRefresh, isPublicRequest },
  });
};

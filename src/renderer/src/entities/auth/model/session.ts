import { isAxiosError } from "axios";

import { refreshTokenApi } from "../api";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "./token";

let refreshTokenRequest: Promise<Awaited<ReturnType<typeof refreshTokenApi>>> | null = null;
let restoreSessionRequest: Promise<boolean> | null = null;

// api 함수가 사용자용 메시지로 감싸서 던지므로 원본 axios 에러는 cause에 있다.
const getErrorStatus = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  if (error instanceof Error && error.cause) {
    return getErrorStatus(error.cause);
  }

  return undefined;
};

/** 서버가 refresh 토큰을 거부한 경우만 true. 네트워크 오류·서버 오류로는 토큰을 지우지 않는다 */
export const isRefreshTokenRejectedError = (error: unknown) => {
  const status = getErrorStatus(error);

  return status === 401 || status === 403;
};

export const refreshAuthTokens = async () => {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    refreshTokenRequest ??= refreshTokenApi(refreshToken);
    const tokens = await refreshTokenRequest;
    await setAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
    });
    return tokens;
  } catch (error) {
    if (isRefreshTokenRejectedError(error)) {
      await clearAuthTokens();
    }
    throw error;
  } finally {
    refreshTokenRequest = null;
  }
};

const restoreAuthSessionInternal = async () => {
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      return true;
    }

    const tokens = await refreshAuthTokens();
    return Boolean(tokens);
  } catch {
    return false;
  }
};

export const restoreAuthSession = () => {
  restoreSessionRequest ??= restoreAuthSessionInternal().finally(() => {
    restoreSessionRequest = null;
  });

  return restoreSessionRequest;
};

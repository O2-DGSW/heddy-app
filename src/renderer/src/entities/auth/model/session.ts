import { refreshTokenApi } from "@/entities";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "./token";
import { isAxiosError } from "axios";

let refreshTokenRequest: Promise<Awaited<ReturnType<typeof refreshTokenApi>>> | null = null;
let restoreSessionRequest: Promise<boolean> | null = null;

export const isRefreshTokenRejectedError = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.status === 401;
  }

  return true;
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

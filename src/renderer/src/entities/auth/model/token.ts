import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getLocalStorage = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

const shouldUseNativeSecureStorage = () => Capacitor.isNativePlatform();

const setToken = async (key: string, token: string) => {
  if (shouldUseNativeSecureStorage()) {
    await SecureStoragePlugin.set({ key, value: token });
    getLocalStorage()?.removeItem(key);
    return;
  }

  getLocalStorage()?.setItem(key, token);
};

const getToken = async (key: string) => {
  if (!shouldUseNativeSecureStorage()) {
    return getLocalStorage()?.getItem(key) ?? null;
  }

  try {
    const { value } = await SecureStoragePlugin.get({ key });
    return value;
  } catch {
    const fallbackToken = getLocalStorage()?.getItem(key) ?? null;

    if (!fallbackToken) {
      return null;
    }

    await SecureStoragePlugin.set({ key, value: fallbackToken });
    getLocalStorage()?.removeItem(key);
    return fallbackToken;
  }
};

const clearToken = async (key: string) => {
  if (shouldUseNativeSecureStorage()) {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch {
      // 이미 삭제된 토큰은 무시한다.
    }
  }

  getLocalStorage()?.removeItem(key);
};

export const setAccessToken = (token: string) => setToken(ACCESS_TOKEN_KEY, token);

export const getAccessToken = () => getToken(ACCESS_TOKEN_KEY);

export const clearAccessToken = () => clearToken(ACCESS_TOKEN_KEY);

export const setRefreshToken = (token: string) => setToken(REFRESH_TOKEN_KEY, token);

export const getRefreshToken = () => getToken(REFRESH_TOKEN_KEY);

export const clearRefreshToken = () => clearToken(REFRESH_TOKEN_KEY);

export const setAuthTokens = async ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}) => {
  await Promise.all([
    setAccessToken(accessToken),
    refreshToken ? setRefreshToken(refreshToken) : clearRefreshToken(),
  ]);
};

export const clearAuthTokens = async () => {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
};

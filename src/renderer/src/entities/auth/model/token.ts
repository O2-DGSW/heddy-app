import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// 요청마다 Keychain(SecureStorage)을 읽으면 네이티브 브리지를 매번 건넌다.
// 한 번 읽은 값은 메모리에 두고, 저장·삭제할 때 같이 바꾼다. null은 "토큰 없음"으로 읽은 상태다.
const tokenCache = new Map<string, string | null>();

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
  } else {
    getLocalStorage()?.setItem(key, token);
  }

  tokenCache.set(key, token);
};

const readToken = async (key: string) => {
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

const getToken = async (key: string) => {
  const cachedToken = tokenCache.get(key);

  if (cachedToken !== undefined) {
    return cachedToken;
  }

  const token = await readToken(key);
  // 읽는 사이 저장·삭제가 먼저 끝났다면 그 값이 최신이다.
  const latestToken = tokenCache.get(key);

  if (latestToken !== undefined) {
    return latestToken;
  }

  tokenCache.set(key, token);
  return token;
};

const clearToken = async (key: string) => {
  tokenCache.set(key, null);

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

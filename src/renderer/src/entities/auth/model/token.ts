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

const setToken = async (key: string, token: string) => {
  try {
    await SecureStoragePlugin.set({ key, value: token });
  } catch {
    getLocalStorage()?.setItem(key, token);
  }
};

const getToken = async (key: string) => {
  try {
    const { value } = await SecureStoragePlugin.get({ key });
    return value;
  } catch {
    return getLocalStorage()?.getItem(key) ?? null;
  }
};

const clearToken = async (key: string) => {
  try {
    await SecureStoragePlugin.remove({ key });
  } catch {
    // Ignore storage plugin failures and still clear the web fallback below.
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

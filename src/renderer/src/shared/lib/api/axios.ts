import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || undefined;

export const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * 액세스 토큰을 읽어오는 함수. 토큰 저장소는 entities 레이어에 있어 shared에서 직접 import할 수 없으므로,
 * 앱 시작 시 app 레이어에서 주입한다(setAccessTokenGetter).
 */
type AccessTokenGetter = () => Promise<string | null>;

let getAccessTokenValue: AccessTokenGetter | null = null;

export const setAccessTokenGetter = (getter: AccessTokenGetter) => {
  getAccessTokenValue = getter;
};

// 인증이 필요한 API는 Bearer 토큰을 요구한다. 매 요청마다 저장된 토큰을 붙인다.
api.interceptors.request.use(async config => {
  if (!getAccessTokenValue) {
    return config;
  }

  const accessToken = await getAccessTokenValue();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

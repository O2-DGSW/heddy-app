import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { refreshTokenApi, token } = vi.hoisted(() => ({
  refreshTokenApi: vi.fn(),
  token: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setAuthTokens: vi.fn(),
    clearAuthTokens: vi.fn(),
  },
}));

vi.mock("../api", () => ({ refreshTokenApi }));
vi.mock("./token", () => token);

import { isRefreshTokenRejectedError, refreshAuthTokens, restoreAuthSession } from "./session";

/** api 함수처럼 사용자용 메시지로 감싼 axios 에러를 만든다 */
const wrappedHttpError = (status: number) => {
  const axiosError = new AxiosError("request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: null,
  });

  return new Error("토큰 재발급에 실패했습니다.", { cause: axiosError });
};

const NEW_TOKENS = { accessToken: "new-access", refreshToken: "new-refresh" };

beforeEach(() => {
  vi.resetAllMocks();
  token.getRefreshToken.mockResolvedValue("old-refresh");
  token.getAccessToken.mockResolvedValue(null);
});

describe("isRefreshTokenRejectedError", () => {
  test("감싼 에러의 cause까지 따라가 401·403만 거부로 본다", () => {
    expect(isRefreshTokenRejectedError(wrappedHttpError(401))).toBe(true);
    expect(isRefreshTokenRejectedError(wrappedHttpError(403))).toBe(true);
    expect(isRefreshTokenRejectedError(wrappedHttpError(500))).toBe(false);
    expect(isRefreshTokenRejectedError(new Error("Network Error"))).toBe(false);
  });
});

describe("refreshAuthTokens", () => {
  test("재발급에 성공하면 새 토큰을 저장한다", async () => {
    refreshTokenApi.mockResolvedValue(NEW_TOKENS);

    await expect(refreshAuthTokens()).resolves.toEqual(NEW_TOKENS);
    expect(token.setAuthTokens).toHaveBeenCalledWith(NEW_TOKENS);
  });

  test("네트워크 오류면 토큰을 지우지 않는다", async () => {
    refreshTokenApi.mockRejectedValue(new Error("Network Error"));

    await expect(refreshAuthTokens()).rejects.toThrow("Network Error");
    expect(token.clearAuthTokens).not.toHaveBeenCalled();
  });

  test("서버가 401로 거부하면 토큰을 지운다", async () => {
    refreshTokenApi.mockRejectedValue(wrappedHttpError(401));

    await expect(refreshAuthTokens()).rejects.toThrow();
    expect(token.clearAuthTokens).toHaveBeenCalledTimes(1);
  });

  test("동시에 여러 번 불러도 재발급 요청은 한 번만 보낸다", async () => {
    refreshTokenApi.mockResolvedValue(NEW_TOKENS);

    await Promise.all([refreshAuthTokens(), refreshAuthTokens(), refreshAuthTokens()]);

    expect(refreshTokenApi).toHaveBeenCalledTimes(1);
  });

  test("refresh 토큰이 없으면 요청하지 않고 null을 돌려준다", async () => {
    token.getRefreshToken.mockResolvedValue(null);

    await expect(refreshAuthTokens()).resolves.toBeNull();
    expect(refreshTokenApi).not.toHaveBeenCalled();
  });
});

describe("restoreAuthSession", () => {
  test("access 토큰이 있으면 재발급 없이 로그인 상태다", async () => {
    token.getAccessToken.mockResolvedValue("access");

    await expect(restoreAuthSession()).resolves.toBe(true);
    expect(refreshTokenApi).not.toHaveBeenCalled();
  });

  test("재발급이 실패하면 로그아웃 상태로 본다", async () => {
    refreshTokenApi.mockRejectedValue(new Error("Network Error"));

    await expect(restoreAuthSession()).resolves.toBe(false);
  });
});

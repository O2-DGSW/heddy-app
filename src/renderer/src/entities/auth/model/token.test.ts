// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from "vitest";

import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "./token";

describe("token", () => {
  beforeEach(async () => {
    await clearAuthTokens();
    window.localStorage.clear();
  });

  test("저장한 토큰은 저장소를 다시 읽지 않고 메모리에서 돌려준다", async () => {
    await setAuthTokens({ accessToken: "access", refreshToken: "refresh" });
    window.localStorage.clear();

    await expect(getAccessToken()).resolves.toBe("access");
    await expect(getRefreshToken()).resolves.toBe("refresh");
  });

  test("지우면 메모리 값도 함께 지운다", async () => {
    await setAuthTokens({ accessToken: "access", refreshToken: "refresh" });
    await clearAuthTokens();

    await expect(getAccessToken()).resolves.toBeNull();
    await expect(getRefreshToken()).resolves.toBeNull();
  });

  test("refresh 토큰 없이 저장하면 이전 refresh 토큰을 지운다", async () => {
    await setAuthTokens({ accessToken: "a1", refreshToken: "r1" });
    await setAuthTokens({ accessToken: "a2" });

    await expect(getAccessToken()).resolves.toBe("a2");
    await expect(getRefreshToken()).resolves.toBeNull();
  });
});

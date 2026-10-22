import { AxiosError, AxiosHeaders } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { ApiHttpError } from "./request.ts";
import {
  apiClient,
  configureApiClient,
  getApiErrorMessage,
  getApiFieldErrors,
  getHttpStatus,
} from "./client.ts";

const auth = {
  getAccessToken: vi.fn<() => Promise<string | null>>(),
  refreshAccessToken: vi.fn<() => Promise<string | null>>(),
  shouldSkipRefresh: (url: string | undefined) => url?.startsWith("/auth/login") ?? false,
  isPublicRequest: (url: string | undefined) => url?.startsWith("/public/") ?? false,
};

const response = (config: InternalAxiosRequestConfig, status: number): AxiosResponse => ({
  status,
  statusText: "",
  headers: {},
  config,
  data: { data: status, message: "서버 메시지" },
});

/** 요청을 기록하고, 헤더의 토큰에 따라 200/401을 돌려주는 가짜 서버 */
const sentAuthorizations: (string | undefined)[] = [];

beforeAll(() => {
  configureApiClient({ baseURL: "https://api.example.test", auth });
  apiClient.defaults.adapter = async config => {
    const authorization = config.headers.get("Authorization")?.toString();
    sentAuthorizations.push(authorization);

    if (authorization === "Bearer valid" || config.url?.startsWith("/public/")) {
      return response(config, 200);
    }

    throw new AxiosError("unauthorized", "ERR_BAD_REQUEST", config, null, response(config, 401));
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  sentAuthorizations.length = 0;
});

describe("configureApiClient", () => {
  test("401이면 토큰을 재발급받아 한 번 다시 보낸다", async () => {
    auth.getAccessToken.mockResolvedValue("expired");
    // 실제 재발급은 새 토큰을 저장한 뒤 돌려주고, 재시도 요청은 저장된 토큰을 다시 읽는다
    auth.refreshAccessToken.mockImplementation(async () => {
      auth.getAccessToken.mockResolvedValue("valid");
      return "valid";
    });

    const res = await apiClient.get("/records");

    expect(res.status).toBe(200);
    expect(auth.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(sentAuthorizations).toEqual(["Bearer expired", "Bearer valid"]);
  });

  test("재발급할 수 없으면 원래 401을 그대로 던진다", async () => {
    auth.getAccessToken.mockResolvedValue("expired");
    auth.refreshAccessToken.mockResolvedValue(null);

    await expect(apiClient.get("/records")).rejects.toMatchObject({ response: { status: 401 } });
  });

  test("로그인 같은 제외 대상은 401이어도 재발급하지 않는다", async () => {
    auth.getAccessToken.mockResolvedValue(null);

    await expect(apiClient.post("/auth/login/email", {})).rejects.toBeInstanceOf(AxiosError);
    expect(auth.refreshAccessToken).not.toHaveBeenCalled();
  });

  test("공개 API에는 토큰을 붙이지 않는다", async () => {
    auth.getAccessToken.mockResolvedValue("valid");

    await apiClient.get("/public/shares/abc");

    expect(sentAuthorizations).toEqual([undefined]);
    expect(auth.getAccessToken).not.toHaveBeenCalled();
  });
});

describe("에러 헬퍼", () => {
  const axiosError = new AxiosError("bad", "ERR_BAD_REQUEST", undefined, undefined, {
    status: 422,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { error: { message: "이미 철회된 공유입니다." } },
  });

  test("감싼 에러의 cause까지 따라가 상태 코드를 찾는다", () => {
    expect(getHttpStatus(new Error("wrapped", { cause: axiosError }))).toBe(422);
    expect(getHttpStatus(new ApiHttpError(404, null))).toBe(404);
    expect(getHttpStatus(new Error("network"))).toBeUndefined();
  });

  test("검증 실패의 필드 오류를 cause까지 따라가 꺼내고, 모양이 다른 항목은 버린다", () => {
    const validationError = new AxiosError("bad", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {
        error: {
          code: "VALIDATION_FAILED",
          message: "필드 검증에 실패했습니다.",
          field_errors: [
            { field: "password", reason: "size must be between 8 and 100" },
            { field: 1, reason: "잘못된 모양" },
          ],
        },
      },
    });

    expect(getApiFieldErrors(new Error("wrapped", { cause: validationError }))).toEqual([
      { field: "password", reason: "size must be between 8 and 100" },
    ]);
    expect(getApiFieldErrors(axiosError)).toEqual([]);
    expect(getApiFieldErrors(new Error("network"))).toEqual([]);
  });

  test("서버 메시지를 우선하고 없으면 기본 문구를 쓴다", () => {
    expect(getApiErrorMessage(axiosError, "실패")).toBe("이미 철회된 공유입니다.");
    expect(getApiErrorMessage("unknown", "실패")).toBe("실패");
  });
});

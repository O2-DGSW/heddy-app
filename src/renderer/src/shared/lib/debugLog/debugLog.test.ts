import { describe, expect, test, vi } from "vitest";

import { createDebugLogger, describeError } from ".";

describe("debugLog", () => {
  test("오류의 이름·메시지·status·code와 cause 체인을 담는다", () => {
    const cause = Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" });
    const error = Object.assign(new Error("연결 실패", { cause }), { status: 503 });

    expect(describeError(error)).toEqual({
      name: "Error",
      message: "연결 실패",
      status: 503,
      cause: { name: "Error", message: "Network Error", code: "ERR_NETWORK" },
    });
    expect(describeError("문자열 오류")).toBe("문자열 오류");
  });

  test("모든 줄 앞에 태그를 붙여 한 줄 문자열로 남긴다", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const logger = createDebugLogger("AR");

    logger.info("연결 상태", { state: "failed" });

    expect(info).toHaveBeenCalledWith('[AR] 연결 상태 {"state":"failed"}');
    info.mockRestore();
  });
});

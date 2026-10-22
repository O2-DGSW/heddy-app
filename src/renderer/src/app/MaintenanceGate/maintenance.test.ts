import { describe, expect, test } from "vitest";

import { isMaintenanceActive, verifyMaintenanceCode } from "./maintenance";

describe("점검 시간", () => {
  test.each([
    ["2026-10-20T23:59:59.999+09:00", false],
    ["2026-10-21T00:00:00+09:00", false],
    ["2026-10-21T23:59:59.999+09:00", false],
    ["2026-10-22T00:00:00+09:00", true],
    ["2026-10-22T20:59:59.999+09:00", true],
    ["2026-10-22T21:00:00+09:00", false],
    ["2026-10-23T00:00:00+09:00", false],
    ["2026-10-22T11:59:59.999Z", true],
    ["2026-10-22T12:00:00Z", false],
  ])("%s의 표시 여부는 %s다", (date, expected) => {
    expect(isMaintenanceActive(Date.parse(date))).toBe(expected);
  });
});

describe("점검 코드", () => {
  test("앞자리 0을 보존한 지정된 6자리 코드만 허용한다", async () => {
    expect(await verifyMaintenanceCode("020202")).toBe(true);
    expect(await verifyMaintenanceCode("123456")).toBe(false);
  });

  test.each(["", "20202", "0202020", "02020a", " 020202", "020202\n"])(
    "잘못된 형식 %j는 허용하지 않는다",
    async code => {
      expect(await verifyMaintenanceCode(code)).toBe(false);
    }
  );
});

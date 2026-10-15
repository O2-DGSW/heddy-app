import { describe, expect, test } from "vitest";

import { createDurationValue, formatDurationDisplay, parseDurationValue } from "./duration";

describe("duration", () => {
  test("분 문자열을 시/분으로 나누고 10분 단위로 내린다", () => {
    expect(parseDurationValue("95")).toEqual({ hour: 1, minute: 30 });
    expect(parseDurationValue("")).toEqual({ hour: 0, minute: 0 });
    expect(parseDurationValue("-10")).toEqual({ hour: 0, minute: 0 });
  });

  test("12시간을 넘으면 12시간으로 묶는다", () => {
    expect(parseDurationValue(String(15 * 60))).toEqual({ hour: 12, minute: 0 });
  });

  test("시/분을 분 문자열로 되돌리고 0분이면 빈 값이다", () => {
    expect(createDurationValue(1, 30)).toBe("90");
    expect(createDurationValue(0, 0)).toBe("");
  });

  test("0인 단위는 빼고 짧게 표시한다", () => {
    expect(formatDurationDisplay("90")).toBe("1시간 30분");
    expect(formatDurationDisplay("120")).toBe("2시간");
    expect(formatDurationDisplay("30")).toBe("30분");
    expect(formatDurationDisplay("0")).toBe("");
  });
});

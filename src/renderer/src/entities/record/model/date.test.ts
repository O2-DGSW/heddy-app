import { describe, expect, test } from "vitest";

import { createCalendarDays, createDateValue, formatDateDisplay, parseDateValue } from "./date";

describe("date", () => {
  test("YYYY-MM-DD 값을 만들고 화면 문구로 바꾼다", () => {
    expect(createDateValue(2026, 3, 5)).toBe("2026-03-05");
    expect(formatDateDisplay("2026-03-05")).toBe("2026. 3. 5");
  });

  test("올바른 날짜는 그대로 나눈다", () => {
    expect(parseDateValue("2026-02-28")).toEqual({ year: 2026, month: 2, day: 28 });
  });

  test("존재하지 않는 날짜는 오늘로 대신한다", () => {
    const today = new Date();

    expect(parseDateValue("2026-02-30")).toEqual({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
  });

  test("달력은 주 단위로 채워지고 이번 달 날짜만 day를 가진다", () => {
    // 2026-03-01은 일요일이라 앞뒤로 채울 날이 없다
    const days = createCalendarDays(2026, 3);

    expect(days.length % 7).toBe(0);
    expect(days[0]).toMatchObject({ id: "2026-03-01", day: 1, isCurrentMonth: true });
    expect(days.filter(day => day.isCurrentMonth)).toHaveLength(31);
  });
});

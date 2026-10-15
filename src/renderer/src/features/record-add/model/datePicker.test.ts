import { describe, expect, test } from "vitest";

import { getClampedDateValue, getShiftedMonthDateValue } from "./datePicker";

describe("datePicker", () => {
  test("그 달에 없는 날은 마지막 날로 맞춘다", () => {
    expect(getClampedDateValue(2026, 2, 31)).toBe("2026-02-28");
    expect(getClampedDateValue(2028, 2, 30)).toBe("2028-02-29");
    expect(getClampedDateValue(2026, 3, 15)).toBe("2026-03-15");
  });

  test("달을 옮기면 날짜를 유지하고, 연도도 넘어간다", () => {
    expect(getShiftedMonthDateValue("2026-01-31", 1)).toBe("2026-02-28");
    expect(getShiftedMonthDateValue("2026-01-15", -1)).toBe("2025-12-15");
    expect(getShiftedMonthDateValue("2026-12-10", 1)).toBe("2027-01-10");
  });
});

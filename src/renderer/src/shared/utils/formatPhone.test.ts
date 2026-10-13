import { describe, expect, test } from "vitest";

import { formatPhone } from "./formatPhone";

describe("formatPhone", () => {
  test("입력 길이에 맞춰 하이픈을 넣는다", () => {
    expect(formatPhone("010")).toBe("010");
    expect(formatPhone("0101234")).toBe("010-1234");
    expect(formatPhone("01012345678")).toBe("010-1234-5678");
  });

  test("숫자가 아닌 문자는 지우고 11자리에서 자른다", () => {
    expect(formatPhone("010-1234-5678")).toBe("010-1234-5678");
    expect(formatPhone("010 1234 56789999")).toBe("010-1234-5678");
    expect(formatPhone("abc")).toBe("");
  });
});

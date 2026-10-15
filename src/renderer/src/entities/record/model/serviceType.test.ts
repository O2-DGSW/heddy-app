import { describe, expect, test } from "vitest";

import { formatServiceTypes, getServiceTypeLabel } from "./serviceType";

describe("serviceType", () => {
  test("시술 종류를 한글로 바꾸고, 모르는 값은 기타로 보여준다", () => {
    expect(getServiceTypeLabel("BLEACH")).toBe("탈색");
    expect(getServiceTypeLabel("UNKNOWN")).toBe("기타");
  });

  test("여러 종류를 가운뎃점으로 잇는다", () => {
    expect(formatServiceTypes(["CUT", "COLOR"])).toBe("커트 · 염색");
    expect(formatServiceTypes([])).toBe("");
  });
});

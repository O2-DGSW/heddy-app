import { describe, expect, test } from "vitest";

import { isPasswordMatch, isRequiredSignupAgreementsAccepted, isValidPhone } from "./validation";

const ALL_DECLINED = {
  terms_of_service: false,
  privacy_policy: false,
  ai_training: false,
  service_analytics: false,
  marketing_notification: false,
};

describe("회원가입 검증", () => {
  test("휴대폰 번호는 하이픈이 들어간 11자리만 통과한다", () => {
    expect(isValidPhone("010-1234-5678")).toBe(true);
    expect(isValidPhone("01012345678")).toBe(false);
    expect(isValidPhone("010-123-5678")).toBe(false);
  });

  test("비밀번호는 비어 있지 않고 확인 값과 같아야 한다", () => {
    expect(isPasswordMatch("secret", "secret")).toBe(true);
    expect(isPasswordMatch("secret", "Secret")).toBe(false);
    expect(isPasswordMatch("", "")).toBe(false);
  });

  test("필수 약관 두 개에 모두 동의해야 하고 선택 약관은 상관없다", () => {
    expect(isRequiredSignupAgreementsAccepted(ALL_DECLINED)).toBe(false);
    expect(isRequiredSignupAgreementsAccepted({ ...ALL_DECLINED, terms_of_service: true })).toBe(
      false
    );
    expect(
      isRequiredSignupAgreementsAccepted({
        ...ALL_DECLINED,
        terms_of_service: true,
        privacy_policy: true,
      })
    ).toBe(true);
  });
});

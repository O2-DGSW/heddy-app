import { describe, expect, test } from "vitest";

import {
  getEmailError,
  getNicknameError,
  getPasswordConfirmError,
  getPasswordError,
  hasEnteredFullPhone,
  isPasswordMatch,
  isRequiredSignupAgreementsAccepted,
  isValidEmail,
  isValidPhone,
  mapSignupFieldErrors,
} from "./validation";

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

describe("isValidEmail", () => {
  test("아이디@도메인.최상위 꼴만 통과한다", () => {
    expect(isValidEmail("user@heddy.site")).toBe(true);
    expect(isValidEmail(" user@heddy.site ")).toBe(true);
    expect(isValidEmail("user@heddy")).toBe(false);
    expect(isValidEmail("user heddy.site")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("hasEnteredFullPhone", () => {
  test("숫자를 10자리 이상 입력해야 끝까지 입력한 것으로 본다", () => {
    expect(hasEnteredFullPhone("010-1234")).toBe(false);
    expect(hasEnteredFullPhone("011-123-4567")).toBe(true);
    expect(hasEnteredFullPhone("010-1234-5678")).toBe(true);
  });
});

describe("칸별 오류 문구", () => {
  test("비밀번호는 8자 미만이면 몇 자인지까지 알려 준다", () => {
    expect(getPasswordError("")).toBe("비밀번호를 입력해주세요.");
    expect(getPasswordError("1234")).toBe("비밀번호는 8자 이상이어야 합니다. (현재 4자)");
    expect(getPasswordError("12345678")).toBeNull();
    expect(getPasswordError("a".repeat(101))).toBe("비밀번호는 100자 이하여야 합니다.");
  });

  test("닉네임은 비었거나 30자를 넘으면 알려 준다", () => {
    expect(getNicknameError("  ")).toBe("닉네임을 입력해주세요.");
    expect(getNicknameError("헤디")).toBeNull();
    expect(getNicknameError("가".repeat(31))).toBe("닉네임은 30자 이하여야 합니다. (현재 31자)");
  });

  test("이메일과 비밀번호 확인 문구", () => {
    expect(getEmailError("")).toBe("이메일을 입력해주세요.");
    expect(getEmailError("heddy")).toContain("올바른 이메일 형식이 아닙니다");
    expect(getEmailError("heddy@example.com")).toBeNull();
    expect(getPasswordConfirmError("12345678", "")).toBe("비밀번호를 한 번 더 입력해주세요.");
    expect(getPasswordConfirmError("12345678", "1234567")).toBe("비밀번호가 일치하지 않습니다.");
  });

  test("서버 field_errors를 칸별 한국어 문구로 바꾸고, 폼에 없는 필드는 뺀다", () => {
    expect(
      mapSignupFieldErrors([
        { field: "password", reason: "size must be between 8 and 100" },
        { field: "nickname", reason: "must not be blank" },
        { field: "email", reason: "must be a well-formed email address" },
        { field: "hair_profile.hair_type", reason: "must not be null" },
      ])
    ).toEqual({
      password: "비밀번호는 8자 이상 100자 이하여야 합니다.",
      nickname: "닉네임을 입력해주세요.",
      email: "올바른 이메일 형식이 아닙니다. 예: heddy@example.com",
    });
    expect(
      mapSignupFieldErrors([{ field: "nickname", reason: "size must be between 0 and 30" }])
    ).toEqual({ nickname: "닉네임은 30자 이하여야 합니다." });
  });
});

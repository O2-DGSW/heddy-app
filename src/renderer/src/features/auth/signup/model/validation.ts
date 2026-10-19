import { REQUIRED_SIGNUP_AGREEMENT_KEYS } from "@/features/auth/signup/constants/signup";
import type { SignupAgreements } from "@/features/auth/signup/model/signup.types";

/** 서버(`POST /auth/signup/email`) 검증 규칙과 맞춘다. 서버가 바뀌면 여기도 같이 바꾼다 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;
export const NICKNAME_MAX_LENGTH = 30;

/** 서버가 최종 판단하므로 화면에서는 "아이디@도메인.최상위"꼴인지만 본다 */
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** 휴대폰 번호를 끝까지(10자리 이상) 입력했는지. 입력 중간에는 형식 오류를 띄우지 않으려고 쓴다 */
export const hasEnteredFullPhone = (phone: string): boolean =>
  phone.replace(/\D/g, "").length >= 10;

export const isValidPhone = (phone: string): boolean => /^\d{3}-\d{4}-\d{4}$/.test(phone);

export const isPasswordMatch = (password: string, confirm: string): boolean =>
  password.length > 0 && password === confirm;

export const isRequiredSignupAgreementsAccepted = (agreements: SignupAgreements): boolean =>
  REQUIRED_SIGNUP_AGREEMENT_KEYS.every(key => agreements[key]);

/* 칸별 오류 문구. 문제가 없으면 null이다. 사용자가 무엇을 고쳐야 하는지 바로 알 수 있게 쓴다 */

export const getEmailError = (email: string): string | null => {
  if (!email.trim()) return "이메일을 입력해주세요.";
  if (!isValidEmail(email)) return "올바른 이메일 형식이 아닙니다. 예: heddy@example.com";
  return null;
};

export const getPasswordError = (password: string): string | null => {
  if (!password) return "비밀번호를 입력해주세요.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다. (현재 ${password.length}자)`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`;
  }
  return null;
};

export const getPasswordConfirmError = (password: string, confirm: string): string | null => {
  if (!confirm) return "비밀번호를 한 번 더 입력해주세요.";
  if (password !== confirm) return "비밀번호가 일치하지 않습니다.";
  return null;
};

export const getNicknameError = (nickname: string): string | null => {
  if (!nickname.trim()) return "닉네임을 입력해주세요.";
  if (nickname.trim().length > NICKNAME_MAX_LENGTH) {
    return `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다. (현재 ${nickname.trim().length}자)`;
  }
  return null;
};

/** 서버가 돌려준 필드 이름. 앱 폼의 칸과 1:1로 대응한다 */
export type SignupServerFieldType = "email" | "password" | "nickname";

const isSignupServerField = (field: string): field is SignupServerFieldType =>
  field === "email" || field === "password" || field === "nickname";

/**
 * 서버 field_errors를 칸별 한국어 문구로 바꾼다. 서버 reason은 영어 검증 메시지라 그대로 보여 주지 않는다.
 * 앱 폼에 없는 필드는 칸에 붙일 수 없어 결과에서 뺀다(화면 하단 공통 문구로 안내한다).
 */
export const mapSignupFieldErrors = (
  fieldErrors: { field: string; reason: string }[]
): Partial<Record<SignupServerFieldType, string>> => {
  const messages: Partial<Record<SignupServerFieldType, string>> = {};

  for (const { field, reason } of fieldErrors) {
    if (!isSignupServerField(field) || messages[field]) continue;

    if (field === "email") {
      messages.email = "올바른 이메일 형식이 아닙니다. 예: heddy@example.com";
    } else if (field === "password") {
      messages.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`;
    } else {
      messages.nickname = /blank|empty/i.test(reason)
        ? "닉네임을 입력해주세요."
        : `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다.`;
    }
  }

  return messages;
};

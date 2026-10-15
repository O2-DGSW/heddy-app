import { REQUIRED_SIGNUP_AGREEMENT_KEYS } from "@/features/auth/signup/constants/signup";
import type { SignupAgreements } from "@/features/auth/signup/model/signup.types";

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

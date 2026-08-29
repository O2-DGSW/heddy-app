import { REQUIRED_SIGNUP_AGREEMENT_KEYS } from "@/features/auth/signup/constants/signup";
import type { SignupAgreements } from "@/features/auth/signup/model/types";

export const isValidPhone = (phone: string): boolean => /^\d{3}-\d{4}-\d{4}$/.test(phone);

export const isPasswordMatch = (password: string, confirm: string): boolean =>
  password.length > 0 && password === confirm;

export const isRequiredSignupAgreementsAccepted = (agreements: SignupAgreements): boolean =>
  REQUIRED_SIGNUP_AGREEMENT_KEYS.every(key => agreements[key]);

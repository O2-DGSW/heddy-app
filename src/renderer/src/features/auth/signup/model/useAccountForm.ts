import { useState } from "react";
import type { BaseAccountForm } from "@/features/auth/signup/model/signup.types";
import {
  getEmailError,
  getNicknameError,
  getPasswordConfirmError,
  getPasswordError,
  hasEnteredFullPhone,
  isRequiredSignupAgreementsAccepted,
  isValidPhone,
} from "./validation";
import type { SignupServerFieldType } from "./validation";

/** 오류가 나면 포커스를 옮길 수 있는 입력 칸. 화면에 보이는 순서대로 둔다 */
export type SignupFieldKeyType = "email" | "password" | "passwordConfirm" | "nickname" | "phone";

export const SIGNUP_FIELD_ORDER: SignupFieldKeyType[] = [
  "email",
  "password",
  "passwordConfirm",
  "nickname",
  "phone",
];

/** 서버가 거부한 값과 문구. 사용자가 그 칸을 고치면(값이 달라지면) 더 이상 보여 주지 않는다 */
export type SignupServerFieldErrorsType = Partial<
  Record<SignupServerFieldType, { message: string; value: string }>
>;

export type SignupFieldErrorsType = Partial<Record<SignupFieldKeyType, string>>;

const SERVER_FIELD_VALUE: Record<SignupServerFieldType, (form: BaseAccountForm) => string> = {
  email: form => form.id.trim(),
  password: form => form.password,
  nickname: form => form.name.trim(),
};

export const useAccountForm = (
  form: BaseAccountForm,
  extraValid: boolean,
  serverFieldErrors: SignupServerFieldErrorsType = {}
) => {
  const [submitted, setSubmitted] = useState(false);
  // 칸을 한 번 벗어난 뒤부터 오류를 보여 준다. 입력 도중에 빨간 글씨가 바로 뜨지 않게 한다.
  const [touched, setTouched] = useState<Partial<Record<SignupFieldKeyType, boolean>>>({});

  const areRequiredAgreementsAccepted = isRequiredSignupAgreementsAccepted(form.agreements);
  const isPhoneValid = isValidPhone(form.phone);

  const clientErrors: Record<Exclude<SignupFieldKeyType, "phone">, string | null> = {
    email: getEmailError(form.id),
    password: getPasswordError(form.password),
    passwordConfirm: getPasswordConfirmError(form.password, form.passwordConfirm),
    nickname: getNicknameError(form.name),
  };

  const getServerError = (field: SignupServerFieldType) => {
    const serverError = serverFieldErrors[field];

    return serverError && serverError.value === SERVER_FIELD_VALUE[field](form)
      ? serverError.message
      : null;
  };

  const isVisible = (field: SignupFieldKeyType) => submitted || Boolean(touched[field]);

  const fieldErrors: SignupFieldErrorsType = {
    email: getServerError("email") ?? (isVisible("email") ? clientErrors.email : null) ?? undefined,
    password:
      getServerError("password") ??
      (isVisible("password") ? clientErrors.password : null) ??
      undefined,
    // 확인 칸은 입력을 시작하면 제출 전에도 바로 알려 준다
    passwordConfirm:
      (isVisible("passwordConfirm") || form.passwordConfirm.length > 0
        ? clientErrors.passwordConfirm
        : null) ?? undefined,
    nickname:
      getServerError("nickname") ??
      (isVisible("nickname") ? clientErrors.nickname : null) ??
      undefined,
  };

  const isValid =
    Object.values(clientErrors).every(error => error === null) &&
    isPhoneValid &&
    extraValid &&
    areRequiredAgreementsAccepted;

  // 인증번호는 휴대폰 번호만 있으면 보낼 수 있다. 다른 칸이 비었다고 막으면 이유를 알 수 없다.
  const canRequestVerification = isPhoneValid;

  // 번호를 끝까지 입력했는데 형식이 틀리면 제출 전에도 알려 준다.
  const showPhoneError = (submitted || hasEnteredFullPhone(form.phone)) && !isPhoneValid;

  const showAgreementError = submitted && !areRequiredAgreementsAccepted;

  // 휴대폰 번호 형식은 맞지만 SMS 본인인증을 아직 완료하지 않아 제출이 막힌 경우에만 노출
  const showVerificationError = submitted && isPhoneValid && !extraValid;

  /** 제출할 때 포커스를 옮길 첫 번째 오류 칸. 지금 값 기준으로 판단한다(아직 안 보인 오류 포함) */
  const getFirstInvalidField = (): SignupFieldKeyType | null =>
    SIGNUP_FIELD_ORDER.find(field =>
      field === "phone" ? !isPhoneValid || !extraValid : clientErrors[field] !== null
    ) ?? null;

  const handleFieldBlur = (field: SignupFieldKeyType) => {
    setTouched(current => (current[field] ? current : { ...current, [field]: true }));
  };

  return {
    isValid,
    canRequestVerification,
    fieldErrors,
    showPhoneError,
    showAgreementError,
    showVerificationError,
    submitted,
    setSubmitted,
    getFirstInvalidField,
    handleFieldBlur,
  };
};

import { useState } from "react";
import type { BaseAccountForm } from "@/features/auth/signup/model/signup.types";
import {
  hasEnteredFullPhone,
  isPasswordMatch,
  isRequiredSignupAgreementsAccepted,
  isValidEmail,
  isValidPhone,
} from "./validation";

export const useAccountForm = (form: BaseAccountForm, extraValid: boolean) => {
  const [submitted, setSubmitted] = useState(false);

  const areRequiredAgreementsAccepted = isRequiredSignupAgreementsAccepted(form.agreements);
  const isPhoneValid = isValidPhone(form.phone);

  const isValid =
    isValidEmail(form.id) &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isPhoneValid &&
    extraValid &&
    areRequiredAgreementsAccepted;

  // 인증번호는 휴대폰 번호만 있으면 보낼 수 있다. 다른 칸이 비었다고 막으면 이유를 알 수 없다.
  const canRequestVerification = isPhoneValid;

  const showEmailError = submitted && !isValidEmail(form.id);

  // 확인 칸을 입력하기 시작하면 제출 전에도 바로 알려 준다.
  const showPasswordError =
    (submitted || form.passwordConfirm.length > 0) &&
    !isPasswordMatch(form.password, form.passwordConfirm);

  // 번호를 끝까지 입력했는데 형식이 틀리면 제출 전에도 알려 준다.
  const showPhoneError = (submitted || hasEnteredFullPhone(form.phone)) && !isPhoneValid;

  const showNameError = submitted && !form.name;

  const showAgreementError = submitted && !areRequiredAgreementsAccepted;

  // 휴대폰 번호 형식은 맞지만 SMS 본인인증을 아직 완료하지 않아 제출이 막힌 경우에만 노출
  const showVerificationError = submitted && isPhoneValid && !extraValid;

  return {
    isValid,
    canRequestVerification,
    showEmailError,
    showPasswordError,
    showPhoneError,
    showNameError,
    showAgreementError,
    showVerificationError,
    submitted,
    setSubmitted,
  };
};

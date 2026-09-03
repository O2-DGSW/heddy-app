import { useState } from "react";
import type { BaseAccountForm } from "@/features/auth/signup/model/types.ts";
import { isValidPhone, isPasswordMatch, isRequiredSignupAgreementsAccepted } from "./validation";

export const useAccountForm = (form: BaseAccountForm, extraValid: boolean) => {
  const [submitted, setSubmitted] = useState(false);

  const areRequiredAgreementsAccepted = isRequiredSignupAgreementsAccepted(form.agreements);

  const isValid =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone) &&
    extraValid &&
    areRequiredAgreementsAccepted;

  const canRequestVerification =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone);

  const showPasswordError = submitted && !isPasswordMatch(form.password, form.passwordConfirm);

  const showPhoneError = submitted && !isValidPhone(form.phone);

  const showNameError = submitted && !form.name;

  const showAgreementError = submitted && !areRequiredAgreementsAccepted;

  return {
    isValid,
    canRequestVerification,
    showPasswordError,
    showPhoneError,
    showNameError,
    showAgreementError,
    submitted,
    setSubmitted,
  };
};

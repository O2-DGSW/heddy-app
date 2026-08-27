import { useState } from "react";
import type { BaseAccountForm } from "@/features/auth/signup/model/types.ts";
import { isValidPhone, isPasswordMatch } from "./validation";

export const useAccountForm = (form: BaseAccountForm, extraValid: boolean) => {
  const [submitted, setSubmitted] = useState(false);
  const hasRequiredAgreements = form.agreements.terms_of_service && form.agreements.privacy_policy;

  const isValid =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone) &&
    extraValid &&
    hasRequiredAgreements;

  const canRequestVerification =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone);

  const showPasswordError = submitted && !isPasswordMatch(form.password, form.passwordConfirm);

  const showPhoneError = submitted && !isValidPhone(form.phone);

  const showNameError = submitted && !form.name;

  return {
    isValid,
    canRequestVerification,
    showPasswordError,
    showPhoneError,
    showNameError,
    submitted,
    setSubmitted,
  };
};

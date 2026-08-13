import { useState } from 'react';
import type { BaseAccountForm } from './types';
import { isValidPhone, isPasswordMatch } from './validation';

export const useAccountForm = (form: BaseAccountForm, extraValid: boolean, onNext: () => void) => {
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone) &&
    extraValid;

  const canRequestVerification =
    !!form.id &&
    !!form.name &&
    isPasswordMatch(form.password, form.passwordConfirm) &&
    isValidPhone(form.phone);

  const showPasswordError = submitted && !isPasswordMatch(form.password, form.passwordConfirm);
  const showPhoneError = submitted && !isValidPhone(form.phone);
  const showNameError = submitted && !form.name;

  const handleNext = () => {
    setSubmitted(true);
    if (isValid) onNext();
  };

  return { isValid, canRequestVerification, showPasswordError, showPhoneError, showNameError, submitted, handleNext };
};
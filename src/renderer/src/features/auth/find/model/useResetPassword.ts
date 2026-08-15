import { useState } from 'react';

export const useResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const canSubmit = password.length > 0 && password === passwordConfirm;

  return {
    passwordField: { value: password, onChange: setPassword },
    passwordConfirmField: { value: passwordConfirm, onChange: setPasswordConfirm },
    canSubmit,
  };
};
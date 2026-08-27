import { useState } from "react";
import { resetPasswordApi } from "@/entities/auth";

export const useResetPassword = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = password.length > 0 && password === passwordConfirm;

  const submitResetPassword = async (phoneNumber: string) => {
    if (!canSubmit || isLoading) {
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      await resetPasswordApi({
        phone_number: phoneNumber.replace(/\D/g, ""),
        new_password: password,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 재설정에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    passwordField: { value: password, onChange: setPassword },
    passwordConfirmField: { value: passwordConfirm, onChange: setPasswordConfirm },
    canSubmit,
    error,
    isLoading,
    submitResetPassword,
  };
};

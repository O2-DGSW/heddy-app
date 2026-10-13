import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSmsVerification } from "@/entities/auth";
import { useFindPassword } from "@/features/auth/find/model/useFindPassword";
import { useResetPassword } from "@/features/auth/find/model/useResetPassword";

import { FindPasswordResetStep } from "./FindPasswordResetStep";
import { FindPasswordVerifyStep } from "./FindPasswordVerifyStep";
import { FindTabs } from "./FindTabs";

export const FindPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const {
    idField,
    carrierField,
    phoneField,
    verificationField,
    canSubmit: canSubmitBase,
  } = useFindPassword();
  const {
    passwordField,
    passwordConfirmField,
    canSubmit: canReset,
    error: resetError,
    isLoading: isResetting,
    submitResetPassword,
  } = useResetPassword();
  const sms = useSmsVerification("PASSWORD_RESET", phoneField.value);

  const canSubmit = canSubmitBase && sms.isVerified;
  const canResetPassword = canReset && !isResetting;

  const handleResetPassword = async () => {
    const isSuccess = await submitResetPassword(phoneField.value);

    if (isSuccess) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <FindTabs activePath="/find-password" />
      {step === 2 ? (
        <FindPasswordResetStep
          passwordField={passwordField}
          passwordConfirmField={passwordConfirmField}
          resetError={resetError}
          isResetting={isResetting}
          canResetPassword={canResetPassword}
          onReset={handleResetPassword}
        />
      ) : (
        <FindPasswordVerifyStep
          idField={idField}
          carrierField={carrierField}
          phoneField={phoneField}
          verificationField={verificationField}
          sms={sms}
          canSubmit={canSubmit}
          onNext={() => setStep(2)}
        />
      )}
    </div>
  );
};

import type { FormEvent } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { CustomerAccountForm as CustomerAccountFormType } from "@/features/auth/signup/model/types";
import { useAccountForm } from "@/features/auth/signup/model/useAccountForm";
import { useSmsVerification } from "@/features/auth/signup/model/useSmsVerification";
import { AccountFormFields } from "@/features/auth/signup/ui/AccountFormFields";

interface CustomerAccountFormProps {
  form: CustomerAccountFormType;
  onChange: (form: CustomerAccountFormType) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CustomerAccountForm = ({
  form,
  onChange,
  onSubmit,
  isLoading,
}: CustomerAccountFormProps) => {
  const sms = useSmsVerification("SIGNUP", form.phone);

  const { isValid, canRequestVerification, showPasswordError, showPhoneError, showNameError } =
    useAccountForm(form, sms.isVerified);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || isLoading) return;

    onSubmit();
  };

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <AccountFormFields
        form={form}
        showPasswordError={showPasswordError}
        showPhoneError={showPhoneError}
        showNameError={showNameError}
        canRequestVerification={canRequestVerification}
        smsVerification={{
          ...sms,
          onSendCode: () => sms.sendCode(form.phone, form.carrier),
          onVerifyCode: () => sms.verifyCode(form.phone, form.verificationCode),
        }}
        onChange={onChange}
      />

      <button
        type="submit"
        className={`mt-4 w-full rounded-2xl py-4 ${font.headline2.semiBold}`}
        style={{
          backgroundColor: isValid ? lightTheme.primary.normal : lightTheme.line.alternative,
          color: isValid ? lightTheme.fill.normal : lightTheme.line.normal,
        }}
        disabled={!isValid || isLoading}
      >
        {isLoading ? "가입 중..." : "회원가입"}
      </button>

      <div
        className={`flex justify-center gap-2 ${font.caption.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        <span>이미 계정이 있으신가요?</span>

        <Link to="/login" style={{ color: lightTheme.primary.normal }} className="underline">
          로그인
        </Link>
      </div>
    </form>
  );
};

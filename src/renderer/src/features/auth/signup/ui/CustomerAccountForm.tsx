import type { FormEvent } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { CustomerAccountForm as CustomerAccountFormType } from "@/features/auth/signup/model/types";
import { useAccountForm } from "@/features/auth/signup/model/useAccountForm";
import { useSmsVerification } from "@/features/auth/signup/model/useSmsVerification";
import { AccountFormFields } from "@/features/auth/signup/ui/AccountFormFields";
import HairProfileField from "@/features/auth/signup/ui/HairProfileField";
import { SignupAgreementsField } from "@/features/auth/signup/ui/SignupAgreementsField";

interface CustomerAccountFormProps {
  form: CustomerAccountFormType;
  onChange: (form: CustomerAccountFormType) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const CustomerAccountForm = ({
  form,
  onChange,
  onSubmit,
  isLoading,
  error,
}: CustomerAccountFormProps) => {
  const sms = useSmsVerification("SIGNUP", form.phone);

  const {
    isValid,
    canRequestVerification,
    showPasswordError,
    showPhoneError,
    showNameError,
    showAgreementError,
    showVerificationError,
    setSubmitted,
  } = useAccountForm(form, sms.isVerified);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

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
        showVerificationError={showVerificationError}
        canRequestVerification={canRequestVerification}
        smsVerification={{
          ...sms,
          onSendCode: () => sms.sendCode(form.phone, form.carrier),
          onVerifyCode: () => sms.verifyCode(form.phone, form.verificationCode),
        }}
        onChange={onChange}
      />

      <HairProfileField
        value={form.hairProfile}
        onChange={hairProfile => onChange({ ...form, hairProfile })}
      />

      <SignupAgreementsField
        agreements={form.agreements}
        showError={showAgreementError}
        onChange={agreements => onChange({ ...form, agreements })}
      />

      {error && (
        <p className={font.caption.regular} style={{ color: lightTheme.status.error }}>
          {error}
        </p>
      )}

      {/*
        isValid가 false여도 버튼 자체를 disabled로 막지 않는다.
        disabled 버튼은 클릭해도 submit 이벤트가 발생하지 않아 setSubmitted(true)가 호출되지 않고,
        결과적으로 위 필드들의 에러 메시지(휴대폰 인증 미완료 등)가 하나도 노출되지 않은 채
        버튼만 계속 회색으로 남는 문제가 있었다. 색상으로만 활성/비활성 상태를 표현하고,
        실제 제출 가능 여부는 handleSubmit 내부의 isValid 체크로 막는다.
      */}
      <button
        type="submit"
        className={`mt-4 w-full rounded-2xl py-4 ${font.headline2.semiBold}`}
        style={{
          backgroundColor: isValid ? lightTheme.primary.normal : lightTheme.line.alternative,
          color: isValid ? lightTheme.fill.normal : lightTheme.line.normal,
        }}
        disabled={isLoading}
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

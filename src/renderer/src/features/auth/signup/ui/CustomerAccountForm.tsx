import type { FormEvent } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { CustomerAccountForm as CustomerAccountFormType } from "@/features/auth/signup/model/types";
import { useAccountForm } from "@/features/auth/signup/model/useAccountForm";
import { useSmsVerification } from "@/features/auth/signup/model/useSmsVerification";
import { AccountFormFields } from "@/features/auth/signup/ui/AccountFormFields";

type AgreementKeyType = keyof CustomerAccountFormType["agreements"];

const AGREEMENT_ITEMS: Array<{ key: AgreementKeyType; label: string; required: boolean }> = [
  { key: "terms_of_service", label: "이용약관", required: true },
  { key: "privacy_policy", label: "개인정보 수집 및 이용", required: true },
  { key: "ai_training", label: "AI 학습 활용", required: false },
  { key: "service_analytics", label: "서비스 분석 활용", required: false },
  { key: "marketing_notification", label: "마케팅 알림 수신", required: false },
];

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
  const allAgreed = AGREEMENT_ITEMS.every(({ key }) => form.agreements[key]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || isLoading) return;

    onSubmit();
  };

  const handleAgreementChange = (key: AgreementKeyType) => {
    onChange({
      ...form,
      agreements: {
        ...form.agreements,
        [key]: !form.agreements[key],
      },
    });
  };

  const handleToggleAllAgreements = () => {
    const nextAgreed = !allAgreed;

    onChange({
      ...form,
      agreements: {
        terms_of_service: nextAgreed,
        privacy_policy: nextAgreed,
        ai_training: nextAgreed,
        service_analytics: nextAgreed,
        marketing_notification: nextAgreed,
      },
    });
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

      <div className="flex flex-col gap-3 px-1">
        <label className={`flex items-center gap-2 ${font.body.medium}`}>
          <input
            type="checkbox"
            checked={allAgreed}
            style={{ accentColor: lightTheme.primary.normal }}
            onChange={handleToggleAllAgreements}
          />
          <span style={{ color: lightTheme.label.normal }}>전체 동의</span>
        </label>

        <div className="flex flex-col gap-2">
          {AGREEMENT_ITEMS.map(({ key, label, required }) => (
            <label key={key} className={`flex items-center gap-2 ${font.caption.regular}`}>
              <input
                type="checkbox"
                checked={form.agreements[key]}
                style={{ accentColor: lightTheme.primary.normal }}
                onChange={() => handleAgreementChange(key)}
              />
              <span style={{ color: lightTheme.label.assistive }}>
                {label}
                {required && <span style={{ color: lightTheme.primary.normal }}> (필수)</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

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

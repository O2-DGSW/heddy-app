import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { OwnerAccountForm as OwnerAccountFormType } from "@/features/auth/signup/model/types";
import { useAccountForm } from "@/features/auth/signup/model/useAccountForm";
import { useSmsVerification } from "@/features/auth/signup/model/useSmsVerification";
import { AccountFormFields } from "@/features/auth/signup/ui/AccountFormFields";

interface OwnerAccountFormProps {
  form: OwnerAccountFormType;
  onChange: (form: OwnerAccountFormType) => void;
  onNext: () => void;
}

export const OwnerAccountForm = ({ form, onChange, onNext }: OwnerAccountFormProps) => {
  const sms = useSmsVerification("OWNER_SIGNUP", form.phone);
  const {
    isValid,
    canRequestVerification,
    showPasswordError,
    showPhoneError,
    showNameError,
    handleNext,
  } = useAccountForm(form, sms.isVerified, onNext);

  return (
    <div className="flex flex-col w-full gap-4">
      <AccountFormFields
        form={form}
        showPasswordError={showPasswordError}
        showPhoneError={showPhoneError}
        showNameError={showNameError}
        canRequestVerification={canRequestVerification}
        nameLabel="대표자명"
        smsVerification={{
          ...sms,
          onSendCode: () => sms.sendCode(form.phone, form.carrier),
          onVerifyCode: () => sms.verifyCode(form.phone, form.verificationCode),
        }}
        onChange={v => onChange({ ...form, ...v })}
      />

      <button
        className={`w-full py-4 rounded-2xl mt-2 ${font.headline2.semiBold}`}
        style={{
          backgroundColor: isValid ? lightTheme.primary.normal : lightTheme.line.alternative,
          color: isValid ? lightTheme.fill.normal : lightTheme.line.normal,
        }}
        disabled={!isValid}
        onClick={handleNext}
      >
        다음으로
      </button>

      <div
        className={`flex justify-center gap-2 ${font.caption.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        <span>이미 계정이 있으신가요?</span>
        <Link to="/login" style={{ color: lightTheme.primary.normal }}>
          로그인
        </Link>
      </div>
    </div>
  );
};

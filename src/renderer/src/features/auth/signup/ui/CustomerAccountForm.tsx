import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { CustomerAccountForm as CustomerAccountFormType } from "@/features/auth/signup/model/signup.types";
import { SIGNUP_FIELD_ORDER, useAccountForm } from "@/features/auth/signup/model/useAccountForm";
import type {
  SignupFieldKeyType,
  SignupServerFieldErrorsType,
} from "@/features/auth/signup/model/useAccountForm";
import { useSmsVerification } from "@/entities/auth";
import { AccountFormFields } from "@/features/auth/signup/ui/AccountFormFields";
import HairProfileField from "@/features/auth/signup/ui/HairProfileField";
import { SignupAgreementsField } from "@/features/auth/signup/ui/SignupAgreementsField";

interface CustomerAccountFormProps {
  form: CustomerAccountFormType;
  onChange: (form: CustomerAccountFormType) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
  /** 서버가 칸별로 거부한 오류. 해당 칸 아래에 보여 주고 첫 칸으로 포커스를 옮긴다 */
  serverFieldErrors?: SignupServerFieldErrorsType;
}

export const CustomerAccountForm = ({
  form,
  onChange,
  onSubmit,
  isLoading,
  error,
  serverFieldErrors = {},
}: CustomerAccountFormProps) => {
  const sms = useSmsVerification("SIGNUP", form.phone);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const fieldRefs = {
    email: emailRef,
    password: passwordRef,
    passwordConfirm: passwordConfirmRef,
    nickname: nicknameRef,
    phone: phoneRef,
  };

  const {
    isValid,
    canRequestVerification,
    fieldErrors,
    showPhoneError,
    showAgreementError,
    showVerificationError,
    setSubmitted,
    getFirstInvalidField,
    handleFieldBlur,
  } = useAccountForm(form, sms.isVerified, serverFieldErrors);

  /** 오류 칸을 화면 가운데로 올리고 포커스를 줘 바로 고칠 수 있게 한다 */
  const focusField = (field: SignupFieldKeyType) => {
    const input = fieldRefs[field].current;

    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (isLoading) return;

    const firstInvalidField = getFirstInvalidField();

    if (firstInvalidField) {
      focusField(firstInvalidField);
      return;
    }

    if (!isValid) return;

    onSubmit();
  };

  // 서버가 칸별 오류를 돌려주면 그중 첫 칸으로 데려간다
  useEffect(() => {
    const firstServerField = SIGNUP_FIELD_ORDER.find(
      field => field !== "passwordConfirm" && field !== "phone" && serverFieldErrors[field]
    );

    if (firstServerField) {
      focusField(firstServerField);
    }
    // 서버 응답이 바뀔 때만 옮긴다. focusField는 ref만 읽어 의존성에서 뺀다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFieldErrors]);

  return (
    <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
      <AccountFormFields
        form={form}
        fieldErrors={fieldErrors}
        emailRef={emailRef}
        passwordRef={passwordRef}
        passwordConfirmRef={passwordConfirmRef}
        nicknameRef={nicknameRef}
        phoneRef={phoneRef}
        onFieldBlur={handleFieldBlur}
        showPhoneError={showPhoneError}
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

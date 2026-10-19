import { font, lightTheme } from "@heddy/design-tokens";
import type { RefObject } from "react";
import { PasswordFields } from "@/features/auth/signup/ui/PasswordFields";
import { PhoneVerificationField } from "@/features/auth/signup/ui/PhoneVerificationField";
import { NICKNAME_MAX_LENGTH } from "@/features/auth/signup/model/validation";
import type {
  SignupFieldErrorsType,
  SignupFieldKeyType,
} from "@/features/auth/signup/model/useAccountForm";

import type {
  CustomerAccountForm,
  SmsVerificationState,
} from "@/features/auth/signup/model/signup.types";

interface AccountFormFieldsProps {
  form: CustomerAccountForm;
  fieldErrors: SignupFieldErrorsType;
  /* 제출에 실패하면 첫 번째 오류 칸으로 포커스를 옮기려고 칸마다 ref를 받는다 */
  emailRef: RefObject<HTMLInputElement | null>;
  passwordRef: RefObject<HTMLInputElement | null>;
  passwordConfirmRef: RefObject<HTMLInputElement | null>;
  nicknameRef: RefObject<HTMLInputElement | null>;
  phoneRef: RefObject<HTMLInputElement | null>;
  onFieldBlur: (field: SignupFieldKeyType) => void;
  showPhoneError: boolean;
  showVerificationError?: boolean;
  canRequestVerification: boolean;
  nameLabel?: string;
  smsVerification: SmsVerificationState;
  onChange: (form: CustomerAccountForm) => void;
}

export const AccountFormFields = ({
  form,
  fieldErrors,
  emailRef,
  passwordRef,
  passwordConfirmRef,
  nicknameRef,
  phoneRef,
  onFieldBlur,
  showPhoneError,
  showVerificationError,
  canRequestVerification,
  nameLabel = "닉네임",
  smsVerification,
  onChange,
}: AccountFormFieldsProps) => {
  const inputStyle = {
    backgroundColor: lightTheme.background.neutral,
    color: lightTheme.label.normal,
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="signup-email"
          className={`${font.label.medium} pl-2`}
          style={{ color: lightTheme.label.assistive }}
        >
          이메일
        </label>

        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          className={`w-full rounded-xl px-4 py-4 focus:outline-none ${font.body.regular}`}
          style={inputStyle}
          placeholder="이메일"
          value={form.id}
          ref={emailRef}
          aria-invalid={Boolean(fieldErrors.email) || undefined}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          onBlur={() => onFieldBlur("email")}
          onChange={e => onChange({ ...form, id: e.target.value })}
        />

        {fieldErrors.email && (
          <p
            id="signup-email-error"
            className={`${font.caption.regular} pl-2`}
            style={{ color: lightTheme.status.error }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      <PasswordFields
        password={form.password}
        passwordConfirm={form.passwordConfirm}
        passwordError={fieldErrors.password}
        passwordConfirmError={fieldErrors.passwordConfirm}
        passwordRef={passwordRef}
        passwordConfirmRef={passwordConfirmRef}
        onPasswordChange={v => onChange({ ...form, password: v })}
        onPasswordConfirmChange={v => onChange({ ...form, passwordConfirm: v })}
        onPasswordBlur={() => onFieldBlur("password")}
        onPasswordConfirmBlur={() => onFieldBlur("passwordConfirm")}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="signup-nickname"
          className={`${font.label.medium} pl-2`}
          style={{ color: lightTheme.label.assistive }}
        >
          {nameLabel}
        </label>

        <input
          id="signup-nickname"
          ref={nicknameRef}
          className={`w-full rounded-xl px-4 py-4 focus:outline-none ${font.body.regular}`}
          style={inputStyle}
          placeholder={`${nameLabel} (${NICKNAME_MAX_LENGTH}자 이하)`}
          value={form.name}
          maxLength={NICKNAME_MAX_LENGTH}
          aria-invalid={Boolean(fieldErrors.nickname) || undefined}
          aria-describedby={fieldErrors.nickname ? "signup-nickname-error" : undefined}
          onBlur={() => onFieldBlur("nickname")}
          onChange={e => onChange({ ...form, name: e.target.value })}
        />

        {fieldErrors.nickname && (
          <p
            id="signup-nickname-error"
            className={`${font.caption.regular} pl-2`}
            style={{ color: lightTheme.status.error }}
          >
            {fieldErrors.nickname}
          </p>
        )}
      </div>

      <PhoneVerificationField
        carrier={form.carrier}
        phone={form.phone}
        verificationCode={form.verificationCode}
        canRequestVerification={canRequestVerification}
        phoneInputRef={phoneRef}
        showPhoneError={showPhoneError}
        showVerificationError={showVerificationError}
        smsVerification={smsVerification}
        onCarrierChange={e => onChange({ ...form, carrier: e })}
        onPhoneChange={e => onChange({ ...form, phone: e })}
        onVerificationCodeChange={v => onChange({ ...form, verificationCode: v })}
      />
    </>
  );
};

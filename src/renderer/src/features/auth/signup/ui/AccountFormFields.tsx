import { font, lightTheme } from "@heddy/design-tokens";
import { PasswordFields } from "@/features/auth/signup/ui/PasswordFields";
import { PhoneVerificationField } from "@/features/auth/signup/ui/PhoneVerificationField";
import type { AccountFormFieldsProps as Props } from "@/features/auth/signup/ui/types";

export const AccountFormFields = ({
  form,
  showPasswordError,
  showPhoneError,
  showNameError,
  canRequestVerification,
  nameLabel = "닉네임",
  smsVerification,
  onChange,
}: Props) => {
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
          className={`w-full rounded-xl px-4 py-4 focus:outline-none ${font.caption.regular}`}
          style={inputStyle}
          placeholder="이메일"
          value={form.id}
          onChange={e => onChange({ ...form, id: e.target.value })}
        />
      </div>

      <PasswordFields
        password={form.password}
        passwordConfirm={form.passwordConfirm}
        showError={showPasswordError}
        onPasswordChange={v => onChange({ ...form, password: v })}
        onPasswordConfirmChange={v => onChange({ ...form, passwordConfirm: v })}
      />

      <div className="flex flex-col gap-1">
        <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
          {nameLabel}
        </p>

        <input
          className={`w-full rounded-xl px-4 py-4 focus:outline-none ${font.caption.regular}`}
          style={inputStyle}
          placeholder={nameLabel}
          value={form.name}
          onChange={e => onChange({ ...form, name: e.target.value })}
        />

        {showNameError && (
          <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.error }}>
            {nameLabel}을 입력해주세요.
          </p>
        )}
      </div>

      <PhoneVerificationField
        carrier={form.carrier}
        phone={form.phone}
        verificationCode={form.verificationCode}
        canRequestVerification={canRequestVerification}
        showPhoneError={showPhoneError}
        smsVerification={smsVerification}
        onCarrierChange={e => onChange({ ...form, carrier: e })}
        onPhoneChange={e => onChange({ ...form, phone: e })}
        onVerificationCodeChange={v => onChange({ ...form, verificationCode: v })}
      />
    </>
  );
};

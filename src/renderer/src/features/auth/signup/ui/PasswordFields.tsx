import { font, lightTheme } from "@heddy/design-tokens";
import type { PasswordFieldsProps as Props } from "@/features/auth/signup/ui/types";
import { PasswordInput } from "@/shared/ui/password-input/PasswordInput";

export const PasswordFields = ({
  password,
  passwordConfirm,
  showError = false,
  onPasswordChange,
  onPasswordConfirmChange,
}: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
        비밀번호
      </p>
      <div className="mb-[3px]">
        <PasswordInput placeholder="비밀번호" value={password} onChange={onPasswordChange} />
      </div>
      <PasswordInput
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChange={onPasswordConfirmChange}
      />
      {showError && (
        <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.error }}>
          비밀번호가 일치하지 않습니다.
        </p>
      )}
    </div>
  );
};

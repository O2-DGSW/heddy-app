import { font, lightTheme } from "@heddy/design-tokens";
import type { RefObject } from "react";
import { PasswordInput } from "@/shared/ui/password-input/PasswordInput";

import { PASSWORD_MAX_LENGTH } from "../model/validation";

interface PasswordFieldsProps {
  password: string;
  passwordConfirm: string;
  passwordError?: string;
  passwordConfirmError?: string;
  passwordRef?: RefObject<HTMLInputElement | null>;
  passwordConfirmRef?: RefObject<HTMLInputElement | null>;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onPasswordBlur?: () => void;
  onPasswordConfirmBlur?: () => void;
}

export const PasswordFields = ({
  password,
  passwordConfirm,
  passwordError,
  passwordConfirmError,
  passwordRef,
  passwordConfirmRef,
  onPasswordChange,
  onPasswordConfirmChange,
  onPasswordBlur,
  onPasswordConfirmBlur,
}: PasswordFieldsProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`${font.label.medium} pl-2`}
        htmlFor="signup-password"
        style={{ color: lightTheme.label.assistive }}
      >
        비밀번호
      </label>
      <PasswordInput
        autoComplete="new-password"
        describedBy={passwordError ? "signup-password-error" : "signup-password-hint"}
        id="signup-password"
        invalid={Boolean(passwordError)}
        maxLength={PASSWORD_MAX_LENGTH}
        onBlur={onPasswordBlur}
        onChange={onPasswordChange}
        placeholder="비밀번호 (8자 이상)"
        ref={passwordRef}
        value={password}
      />
      {passwordError ? (
        <p
          className={`${font.caption.regular} pl-2`}
          id="signup-password-error"
          style={{ color: lightTheme.status.error }}
        >
          {passwordError}
        </p>
      ) : (
        <p
          className={`${font.caption.regular} pl-2`}
          id="signup-password-hint"
          style={{ color: lightTheme.label.assistive }}
        >
          8자 이상 입력해주세요.
        </p>
      )}
      <div className="mt-[3px]">
        <PasswordInput
          autoComplete="new-password"
          describedBy={passwordConfirmError ? "signup-password-confirm-error" : undefined}
          id="signup-password-confirm"
          invalid={Boolean(passwordConfirmError)}
          maxLength={PASSWORD_MAX_LENGTH}
          onBlur={onPasswordConfirmBlur}
          onChange={onPasswordConfirmChange}
          placeholder="비밀번호 확인"
          ref={passwordConfirmRef}
          value={passwordConfirm}
        />
      </div>
      {passwordConfirmError && (
        <p
          className={`${font.caption.regular} pl-2`}
          id="signup-password-confirm-error"
          style={{ color: lightTheme.status.error }}
        >
          {passwordConfirmError}
        </p>
      )}
    </div>
  );
};

import { font, lightTheme } from "@heddy/design-tokens";

import { PasswordInput } from "@/shared/ui/password-input/PasswordInput";

interface FieldState {
  value: string;
  onChange: (value: string) => void;
}

interface FindPasswordResetStepProps {
  passwordField: FieldState;
  passwordConfirmField: FieldState;
  isPasswordMismatch: boolean;
  resetError: string | null;
  isResetting: boolean;
  canResetPassword: boolean;
  onReset: () => void;
}

/** 비밀번호 찾기 2단계: 본인 확인 뒤 새 비밀번호를 정한다 */
export const FindPasswordResetStep = ({
  passwordField,
  passwordConfirmField,
  isPasswordMismatch,
  resetError,
  isResetting,
  canResetPassword,
  onReset,
}: FindPasswordResetStepProps) => (
  <>
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-1">
        <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
          새 비밀번호
        </p>
        <div className="mb-1">
          <PasswordInput
            placeholder="비밀번호"
            value={passwordField.value}
            onChange={passwordField.onChange}
          />
        </div>
        <div className="mb-3">
          <PasswordInput
            placeholder="비밀번호 확인"
            value={passwordConfirmField.value}
            onChange={passwordConfirmField.onChange}
          />
          {isPasswordMismatch && (
            <p
              className={`${font.caption.regular} mt-1 pl-2`}
              role="alert"
              style={{ color: lightTheme.status.error }}
            >
              비밀번호가 일치하지 않습니다.
            </p>
          )}
        </div>
      </div>
    </div>
    <div className="w-full pb-8">
      {resetError && (
        <p
          className={`${font.caption.regular} mb-3 pl-2`}
          style={{ color: lightTheme.status.error }}
        >
          {resetError}
        </p>
      )}
      <button
        type="button"
        className={`w-full py-4 rounded-2xl ${font.headline2.semiBold}`}
        style={{
          backgroundColor: canResetPassword
            ? lightTheme.primary.normal
            : lightTheme.line.alternative,
          color: canResetPassword ? lightTheme.fill.normal : lightTheme.line.normal,
        }}
        disabled={!canResetPassword}
        onClick={onReset}
      >
        {isResetting ? "변경 중" : "비밀번호 변경"}
      </button>
    </div>
  </>
);

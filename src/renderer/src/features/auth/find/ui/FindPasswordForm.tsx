import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { useFindPassword } from "@/features/auth/find/model/useFindPassword";
import { useResetPassword } from "@/features/auth/find/model/useResetPassword";
import { useSmsVerification } from "@/features/auth/signup/model/useSmsVerification";
import type { Carrier, MvnoCarrier } from "@/features/auth/signup/model/types";
import { MAIN_CARRIERS, MVNO_CARRIERS } from "@/features/auth/signup/constants/signup";
import { RadioButton } from "@/shared/ui/radio/RadioButton";
import { PasswordInput } from "@/shared/ui/password-input/PasswordInput";

const MVNO_SET = new Set<string>(MVNO_CARRIERS);
const isMvno = (c: Carrier): c is MvnoCarrier => MVNO_SET.has(c);

export const FindPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const {
    idField,
    carrierField,
    phoneField,
    verificationField,
    canSubmit: canSubmitBase,
  } = useFindPassword();
  const { passwordField, passwordConfirmField, canSubmit: canReset } = useResetPassword();
  const sms = useSmsVerification("PASSWORD_RESET", phoneField.value);

  const canSubmit = canSubmitBase && sms.isVerified;

  const inputStyle = {
    backgroundColor: lightTheme.background.neutral,
    color: lightTheme.label.normal,
  };

  const tabs = (
    <div
      className="flex w-full mb-8"
      style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
    >
      {[
        { label: "아이디 찾기", path: "/find-id", isActive: false },
        { label: "비밀번호 찾기", path: "/find-password", isActive: true },
      ].map(({ label, path, isActive }) => (
        <button
          key={path}
          className={`flex-1 pt-3 flex flex-col items-center ${font.body.bold}`}
          style={{ color: isActive ? lightTheme.label.normal : lightTheme.label.assistive }}
          onClick={() => !isActive && navigate(path, { replace: true })}
        >
          <span className="pb-3">{label}</span>
          <div
            className="w-[60px] h-[2px] -mb-px"
            style={{ backgroundColor: isActive ? lightTheme.label.normal : "transparent" }}
          />
        </button>
      ))}
    </div>
  );

  if (step === 2) {
    return (
      <div className="flex flex-col w-full flex-1">
        {tabs}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col gap-1">
            <p
              className={`${font.label.medium} pl-2`}
              style={{ color: lightTheme.label.assistive }}
            >
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
            </div>
          </div>
        </div>
        <div className="w-full pb-8">
          <button
            className={`w-full py-4 rounded-2xl ${font.headline2.semiBold}`}
            style={{
              backgroundColor: canReset ? lightTheme.primary.normal : lightTheme.line.alternative,
              color: canReset ? lightTheme.fill.normal : lightTheme.line.normal,
            }}
            disabled={!canReset}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      {tabs}
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            아이디
          </p>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="아이디"
            value={idField.value}
            onChange={e => idField.onChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            전화번호
          </p>
          <div className="flex items-center gap-9 flex-wrap ml-2">
            {MAIN_CARRIERS.map(c => (
              <RadioButton
                key={c}
                label={c}
                selected={carrierField.value === c}
                onClick={() => carrierField.onChange(c)}
              />
            ))}
            <select
              className={`focus:outline-none bg-transparent ${font.caption.medium}`}
              style={{
                color: isMvno(carrierField.value)
                  ? lightTheme.primary.normal
                  : lightTheme.label.assistive,
              }}
              value={isMvno(carrierField.value) ? carrierField.value : ""}
              onChange={e => carrierField.onChange(e.target.value as MvnoCarrier)}
            >
              <option value="" disabled>
                알뜰폰
              </option>
              {MVNO_CARRIERS.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mb-1">
            <input
              className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
              style={inputStyle}
              placeholder="전화번호"
              value={phoneField.value}
              onChange={e => phoneField.onChange(e.target.value)}
            />
            <button
              className={`px-6 py-4 rounded-xl ${font.label.medium}`}
              style={{
                backgroundColor:
                  phoneField.canRequest && !sms.isSending
                    ? lightTheme.primary.normal
                    : lightTheme.line.alternative,
                color:
                  phoneField.canRequest && !sms.isSending
                    ? lightTheme.fill.normal
                    : lightTheme.line.normal,
              }}
              disabled={!phoneField.canRequest || sms.isSending}
              onClick={() => sms.sendCode(phoneField.value, carrierField.value)}
            >
              {sms.isSending ? "발송 중" : sms.isSent ? "재전송" : "인증번호"}
            </button>
          </div>
          {sms.isSent && !sms.isVerified && (
            <div className="flex gap-2 mb-1">
              <input
                className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
                style={inputStyle}
                placeholder="인증번호"
                value={verificationField.value}
                onChange={e => verificationField.onChange(e.target.value)}
              />
              <button
                className={`px-6 py-4 rounded-xl ${font.label.medium}`}
                style={{
                  backgroundColor:
                    verificationField.value.length > 0 && !sms.isVerifying
                      ? lightTheme.primary.normal
                      : lightTheme.line.alternative,
                  color:
                    verificationField.value.length > 0 && !sms.isVerifying
                      ? lightTheme.fill.normal
                      : lightTheme.line.normal,
                }}
                disabled={verificationField.value.length === 0 || sms.isVerifying}
                onClick={() => sms.verifyCode(phoneField.value, verificationField.value)}
              >
                {sms.isVerifying ? "확인 중" : "확인"}
              </button>
            </div>
          )}
          {sms.isVerified && (
            <p
              className={`${font.caption.regular} pl-2 mb-1`}
              style={{ color: lightTheme.status.success }}
            >
              인증이 완료되었습니다.
            </p>
          )}
          {sms.smsError && (
            <p
              className={`${font.caption.regular} pl-2 mb-1`}
              style={{ color: lightTheme.status.error }}
            >
              {sms.smsError}
            </p>
          )}
        </div>
      </div>

      <div className="w-full pb-8">
        <button
          className={`w-full py-4 rounded-2xl ${font.headline2.semiBold}`}
          style={{
            backgroundColor: canSubmit ? lightTheme.primary.normal : lightTheme.line.alternative,
            color: canSubmit ? lightTheme.fill.normal : lightTheme.line.normal,
          }}
          disabled={!canSubmit}
          onClick={() => setStep(2)}
        >
          비밀번호 찾기
        </button>
      </div>
    </div>
  );
};

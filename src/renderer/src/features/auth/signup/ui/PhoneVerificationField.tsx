import { font, lightTheme } from "@heddy/design-tokens";
import type { Carrier, MvnoCarrier } from "@/features/auth/signup/model/types";
import { MAIN_CARRIERS, MVNO_CARRIERS } from "@/features/auth/signup/constants/signup";
import { RadioButton } from "@/shared/ui/radio/RadioButton";
import { formatPhone } from "@/shared/utils/formatPhone";
import type { PhoneVerificationFieldProps as Props } from "@/features/auth/signup/ui/types";

const MVNO_SET = new Set<string>(MVNO_CARRIERS);
const isMvno = (c: Carrier): c is MvnoCarrier => MVNO_SET.has(c);

export const PhoneVerificationField = ({
  carrier,
  phone,
  verificationCode,
  canRequestVerification,
  showPhoneError = false,
  smsVerification,
  onCarrierChange,
  onPhoneChange,
  onVerificationCodeChange,
}: Props) => {
  const { isSent, isVerified, isSending, isVerifying, smsError, onSendCode, onVerifyCode } =
    smsVerification;

  const inputStyle = {
    backgroundColor: lightTheme.background.neutral,
    color: lightTheme.label.normal,
  };

  const isAlddulSelected = isMvno(carrier);
  const canSend = canRequestVerification && !isSending;

  return (
    <div className="flex flex-col gap-2">
      <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
        휴대폰 번호
      </p>
      <div className="flex items-center justify-between flex-wrap ml-2">
        {MAIN_CARRIERS.map(c => (
          <RadioButton
            key={c}
            label={c}
            selected={carrier === c}
            onClick={() => onCarrierChange(c)}
          />
        ))}
        <select
          className={`focus:outline-none bg-transparent ${font.caption.medium}`}
          style={{
            color: isAlddulSelected ? lightTheme.primary.normal : lightTheme.label.assistive,
          }}
          value={isAlddulSelected ? carrier : ""}
          onChange={e => onCarrierChange(e.target.value as Carrier)}
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
      <div className="flex gap-2">
        <input
          className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
          style={inputStyle}
          placeholder="휴대폰 번호"
          value={phone}
          onChange={e => onPhoneChange(formatPhone(e.target.value))}
        />
        <button
          type="button"
          className={`w-[5.5rem] shrink-0 py-4 rounded-xl ${font.label.medium}`}
          style={{
            backgroundColor: canSend ? lightTheme.primary.normal : lightTheme.line.alternative,
            color: canSend ? lightTheme.fill.normal : lightTheme.line.normal,
          }}
          disabled={!canSend}
          onClick={onSendCode}
        >
          {isSending ? "발송 중" : isSent ? "재전송" : "인증번호"}
        </button>
      </div>
      {showPhoneError && (
        <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.error }}>
          올바른 휴대폰 번호를 입력해주세요.
        </p>
      )}
      {isSent && !isVerified && (
        <div className="flex gap-2">
          <input
            className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
            style={inputStyle}
            placeholder="인증번호"
            value={verificationCode}
            onChange={e => onVerificationCodeChange(e.target.value)}
          />
          <button
            type="button"
            className={`w-[5.5rem] shrink-0 py-4 rounded-xl ${font.label.medium}`}
            style={{
              backgroundColor:
                verificationCode.length > 0 && !isVerifying
                  ? lightTheme.primary.normal
                  : lightTheme.line.alternative,
              color:
                verificationCode.length > 0 && !isVerifying
                  ? lightTheme.fill.normal
                  : lightTheme.line.normal,
            }}
            disabled={verificationCode.length === 0 || isVerifying}
            onClick={onVerifyCode}
          >
            {isVerifying ? "확인 중" : "확인"}
          </button>
        </div>
      )}
      {isVerified && (
        <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.success }}>
          인증이 완료되었습니다.
        </p>
      )}
      {smsError && (
        <p className={`${font.caption.regular} pl-2`} style={{ color: lightTheme.status.error }}>
          {smsError}
        </p>
      )}
    </div>
  );
};

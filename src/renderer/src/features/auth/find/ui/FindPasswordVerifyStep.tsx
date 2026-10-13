import { font, lightTheme } from "@heddy/design-tokens";

import { MAIN_CARRIERS, MVNO_CARRIERS, isMvnoCarrier } from "@/entities/auth";
import type { Carrier, MvnoCarrier, useSmsVerification } from "@/entities/auth";
import { RadioButton } from "@/shared/ui/radio/RadioButton";

interface FieldState<TValue = string> {
  value: TValue;
  onChange: (value: TValue) => void;
}

interface FindPasswordVerifyStepProps {
  idField: FieldState;
  carrierField: FieldState<Carrier>;
  phoneField: FieldState & { canRequest: boolean };
  verificationField: FieldState;
  sms: ReturnType<typeof useSmsVerification>;
  canSubmit: boolean;
  onNext: () => void;
}

const inputStyle = {
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.normal,
};

/** 비밀번호 찾기 1단계: 아이디와 휴대폰 인증으로 본인을 확인한다 */
export const FindPasswordVerifyStep = ({
  idField,
  carrierField,
  phoneField,
  verificationField,
  sms,
  canSubmit,
  onNext,
}: FindPasswordVerifyStepProps) => (
  <>
    <div className="flex flex-col gap-6 flex-1">
      <div className="flex flex-col gap-1">
        <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
          아이디
        </p>
        <input
          className={`w-full px-4 py-4 rounded-xl focus:outline-none ${font.body.regular}`}
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
        <div className="flex items-center justify-between flex-wrap ml-2">
          {MAIN_CARRIERS.map(c => (
            <RadioButton
              key={c}
              label={c}
              selected={carrierField.value === c}
              onClick={() => carrierField.onChange(c)}
            />
          ))}
          <select
            className={`focus:outline-none bg-transparent ${font.body.medium}`}
            style={{
              color: isMvnoCarrier(carrierField.value)
                ? lightTheme.primary.normal
                : lightTheme.label.assistive,
            }}
            value={isMvnoCarrier(carrierField.value) ? carrierField.value : ""}
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
            className={`min-w-0 flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.body.regular}`}
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
            type="button"
          >
            {sms.isSending ? "발송 중" : sms.isSent ? "재전송" : "인증번호"}
          </button>
        </div>
        {sms.isSent && !sms.isVerified && (
          <div className="flex gap-2 mb-1">
            <input
              className={`min-w-0 flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.body.regular}`}
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
              type="button"
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
        onClick={onNext}
        type="button"
      >
        비밀번호 찾기
      </button>
    </div>
  </>
);

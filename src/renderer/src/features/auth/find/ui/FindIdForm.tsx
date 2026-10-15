import { font, lightTheme } from "@heddy/design-tokens";
import { useFindId } from "@/features/auth/find/model/useFindId";

import { FindTabs } from "./FindTabs";

export const FindIdForm = () => {
  const {
    phone,
    verificationCode,
    canRequestVerification,
    canSubmit,
    handlePhoneChange,
    setVerificationCode,
  } = useFindId();

  return (
    <div className="flex flex-col w-full flex-1">
      <FindTabs activePath="/find-id" />

      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            전화번호
          </p>
          <div className="flex gap-2 mb-1">
            <input
              className={`min-w-0 flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.body.regular}`}
              style={{
                backgroundColor: lightTheme.background.neutral,
                color: lightTheme.label.normal,
              }}
              placeholder="전화번호"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
            />
            <button
              className={`px-6 py-4 rounded-xl ${font.label.medium}`}
              style={{
                backgroundColor: canRequestVerification
                  ? lightTheme.primary.normal
                  : lightTheme.line.alternative,
                color: canRequestVerification ? lightTheme.fill.normal : lightTheme.line.normal,
              }}
              disabled={!canRequestVerification}
              type="button"
            >
              인증번호
            </button>
          </div>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none mb-3 ${font.body.regular}`}
            style={{
              backgroundColor: lightTheme.background.neutral,
              color: lightTheme.label.normal,
            }}
            placeholder="인증번호"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
          />
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
          type="button"
        >
          아이디 찾기
        </button>
      </div>
    </div>
  );
};

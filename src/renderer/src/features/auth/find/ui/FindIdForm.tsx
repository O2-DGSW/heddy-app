import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { useFindId } from "@/features/auth/find/model/useFindId";

export const FindIdForm = () => {
  const navigate = useNavigate();
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
      <div
        className="flex w-full mb-8"
        style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
      >
        {[
          { label: "아이디 찾기", path: "/find-id", isActive: true },
          { label: "비밀번호 찾기", path: "/find-password", isActive: false },
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

      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1">
          <p className={`${font.label.medium} pl-2`} style={{ color: lightTheme.label.assistive }}>
            전화번호
          </p>
          <div className="flex gap-2 mb-1">
            <input
              className={`flex-1 px-4 py-4 rounded-xl focus:outline-none ${font.caption.regular}`}
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
            >
              인증번호
            </button>
          </div>
          <input
            className={`w-full px-4 py-4 rounded-xl focus:outline-none mb-3 ${font.caption.regular}`}
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
        >
          아이디 찾기
        </button>
      </div>
    </div>
  );
};

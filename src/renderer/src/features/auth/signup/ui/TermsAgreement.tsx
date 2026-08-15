import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import { RadioButton } from "@/shared/ui/radio/RadioButton";

interface TermsAgreementProps {
  onSignup?: () => Promise<void>;
}

export const TermsAgreement = ({ onSignup }: TermsAgreementProps) => {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const handleSignup = async () => {
    await onSignup?.();
  };

  const allAgreed = agreedTerms && agreedPrivacy;

  const toggleAll = () => {
    const next = !allAgreed;
    setAgreedTerms(next);
    setAgreedPrivacy(next);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="pl-1 flex items-center gap-2">
            <RadioButton
              label=""
              selected={agreedTerms}
              onClick={() => setAgreedTerms(prev => !prev)}
            />
            <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
              이용약관 <span style={{ color: lightTheme.primary.normal }}>(필수)</span>
            </p>
          </div>
          <div
            className={`w-full h-28 p-3 rounded-xl overflow-y-auto ${font.label.medium}`}
            style={{
              backgroundColor: lightTheme.background.alternative,
              color: lightTheme.label.assistive,
            }}
          >
            {/* TODO: 이용약관 내용 */}
            용약관(이하 "이용약관")은 네이버 제트 주식회사의 ZEPETO 관련하여 제공하는 프로그램,
            소프트웨어 등(이하 "서비스") 및 본 이용약관의 적용을 받으며...
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="pl-1 flex items-center gap-2">
            <RadioButton
              label=""
              selected={agreedPrivacy}
              onClick={() => setAgreedPrivacy(prev => !prev)}
            />
            <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
              개인정보 수집 및 이용 동의{" "}
              <span style={{ color: lightTheme.primary.normal }}>(필수)</span>
            </p>
          </div>
          <div
            className={`w-full h-28 p-3 rounded-xl overflow-y-auto ${font.label.medium}`}
            style={{
              backgroundColor: lightTheme.background.alternative,
              color: lightTheme.label.assistive,
            }}
          >
            {/* TODO: 개인정보 수집 내용 */}
            수집하는 개인정보: 사는 이용자들에게 서비스의 다양한 기능과 편의성을 제공하기 위하여
            목적별로 이용자들의 개인정보를 필수 항목과 선택항목으로 구분하여 수집하고 있습니다...
          </div>
        </div>

        <div className="pl-1 flex items-center gap-2">
          <RadioButton label="" selected={allAgreed} onClick={toggleAll} />
          <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
            네, 모두 동의합니다.
          </p>
        </div>
      </div>

      <button
        className={`w-full py-4 rounded-2xl ${font.headline2.semiBold}`}
        style={{
          backgroundColor: allAgreed ? lightTheme.primary.normal : lightTheme.line.alternative,
          color: allAgreed ? lightTheme.fill.normal : lightTheme.line.normal,
        }}
        onClick={handleSignup}
        disabled={!allAgreed}
      >
        회원가입
      </button>

      <div
        className={`flex justify-center gap-2 ${font.caption.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        <span>이미 계정이 있으신가요?</span>
        <Link to="/login" style={{ color: lightTheme.primary.normal }}>
          로그인
        </Link>
      </div>
    </div>
  );
};

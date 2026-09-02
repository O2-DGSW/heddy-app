import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

export const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-between overflow-y-auto px-6 py-24">
      {/*  */}
      <div className="flex flex-col items-center gap-2.5">
        <img src="/heddyIcon.svg" alt="heddy" className="w-64 mb-3" />
        <p className={font.headline1.semiBold} style={{ color: lightTheme.label.neutral }}>
          헤디에 오신 것을 환영해요!
        </p>

        <div
          className={`${font.label.medium} text-center`}
          style={{ color: lightTheme.label.assistive }}
        >
          <p>시술기록 저장부터 나에게</p>
          <p>맞는 머리 추천까지, 헤디로 시작하세요</p>
        </div>
      </div>

      <img src="/agua.svg" alt="아거!" className="w-35" />

      <div className="w-full flex flex-col items-center gap-6">
        <button
          type="button"
          className={`w-full py-4 rounded-2xl ${font.headline2.semiBold}`}
          style={{
            backgroundColor: lightTheme.primary.normal,
            color: lightTheme.fill.normal,
          }}
          onClick={() => navigate("/login")}
        >
          로그인
        </button>

        <div className="flex flex-row items-center justify-center gap-2">
          <p className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
            계정이 없으시다면?
          </p>
          <button
            type="button"
            className={`${font.label.medium} border-0 bg-transparent p-0 underline`}
            style={{ color: lightTheme.primary.normal }}
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

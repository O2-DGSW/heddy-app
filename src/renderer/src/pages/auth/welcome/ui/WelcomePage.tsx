import { setNavigation } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setNavigation("forward", "forward");
    navigate("/login");
  };

  const handleSignupClick = () => {
    setNavigation("forward", "forward");
    navigate("/signup");
  };

  return (
    <cap-page>
      <section
        aria-labelledby="welcome-title"
        className="h-full touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]"
        style={pageStyle}
      >
        <div className="flex min-h-full flex-col items-center justify-between px-6 py-24">
          <div className="flex flex-col items-center gap-2.5">
            <img src="/heddyIcon.svg" alt="heddy" className="mb-3 w-64" />
            <h1
              className={font.headline1.semiBold}
              id="welcome-title"
              style={{ color: lightTheme.label.neutral }}
            >
              헤디에 오신 것을 환영해요!
            </h1>

            <div
              className={`${font.label.medium} text-center`}
              style={{ color: lightTheme.label.assistive }}
            >
              <p>시술기록 저장부터 나에게</p>
              <p>맞는 머리 추천까지, 헤디로 시작하세요</p>
            </div>
          </div>

          <img src="/agua.svg" alt="아거!" className="w-35" />

          <div className="flex w-full flex-col items-center gap-6">
            <button
              className={`w-full rounded-2xl py-4 ${font.headline2.semiBold}`}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.fill.normal,
              }}
              onClick={handleLoginClick}
              type="button"
            >
              로그인
            </button>

            <div className="flex flex-row items-center justify-center gap-2">
              <p className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
                계정이 없으시다면?
              </p>
              <button
                className={`${font.label.medium} border-0 bg-transparent p-0 underline`}
                style={{ color: lightTheme.primary.normal }}
                onClick={handleSignupClick}
                type="button"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </section>
    </cap-page>
  );
};

export default WelcomePage;

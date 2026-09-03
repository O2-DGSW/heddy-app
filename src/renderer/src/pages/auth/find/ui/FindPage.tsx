import { useLocation } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { AuthBackButton } from "@/features/auth/back-button";
import { FindIdForm, FindPasswordForm } from "@/features/auth/find";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const FindPage = () => {
  const { pathname } = useLocation();

  const isPassword = pathname === "/find-password";
  const title = isPassword ? "비밀번호 찾기" : "아이디 찾기";

  return (
    <cap-page>
      <section
        aria-labelledby="find-title"
        className="relative flex h-full min-h-0 flex-col items-center overflow-hidden px-6"
        style={pageStyle}
      >
        <header className="h-[58px] w-full shrink-0">
          <AuthBackButton fallbackPath="/login" />
        </header>

        <div className="flex min-h-0 w-full flex-1 flex-col items-center touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]">
          <div className="mb-10 flex flex-col items-center gap-2 pt-[36px]">
            <img src="/heddyIcon.svg" alt="heddy" className="w-50" />

            <h1
              className={font.body.medium}
              id="find-title"
              style={{ color: lightTheme.label.assistive }}
            >
              {title}
            </h1>
          </div>

          {isPassword ? <FindPasswordForm /> : <FindIdForm />}
        </div>
      </section>
    </cap-page>
  );
};

export default FindPage;

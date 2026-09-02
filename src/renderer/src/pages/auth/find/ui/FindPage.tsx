import { useLocation } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { FindIdForm, FindPasswordForm } from "@/features/auth/find";
import { BackButton } from "@/shared";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const FindPage = () => {
  const { pathname } = useLocation();

  const isPassword = pathname === "/find-password";
  const title = isPassword ? "비밀번호 찾기" : "아이디 찾기";

  return (
    <cap-page>
      <section
        aria-labelledby="find-title"
        className="flex min-h-full flex-col items-center px-6 pb-8"
        style={pageStyle}
      >
        <header className="flex h-[58px] w-full shrink-0 items-center">
          <BackButton fallbackPath="/login" />
        </header>

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
      </section>
    </cap-page>
  );
};

export default FindPage;

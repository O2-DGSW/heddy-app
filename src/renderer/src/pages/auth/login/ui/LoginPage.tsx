import { lightTheme, font } from "@heddy/design-tokens";
import { LoginForm, SocialLogin } from "@/features/auth/login";
import { BackButton } from "@/shared";

const pageStyle = { backgroundColor: lightTheme.background.normal };

const LoginPage = () => {
  return (
    <cap-page>
      <section
        aria-labelledby="login-title"
        className="flex h-full min-h-0 flex-col overflow-hidden px-6 pb-8"
        style={pageStyle}
      >
        <header className="flex h-[58px] shrink-0 items-center">
          <BackButton fallbackPath="/welcome" />
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]">
          <div className="flex min-h-full flex-col items-center justify-center py-8">
            <div className="mb-14 flex flex-col items-center gap-2">
              <img src="/heddyIcon.svg" alt="heddy" className="w-50" />
              <h1
                className={font.body.medium}
                id="login-title"
                style={{ color: lightTheme.label.assistive }}
              >
                로그인
              </h1>
            </div>

            <LoginForm />

            <div className="mt-10 w-full">
              <SocialLogin />
            </div>
          </div>
        </div>
      </section>
    </cap-page>
  );
};

export default LoginPage;

import { lightTheme, font } from "@heddy/design-tokens";
import { LoginForm, SocialLogin } from "@/features/auth/login";

export const LoginPage = () => {
  return (
    <div
      className="h-full overflow-y-auto flex flex-col justify-start items-center px-6 pt-8"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex flex-col items-center gap-2 mb-14">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />
        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          로그인
        </p>
      </div>

      <LoginForm />

      <div className="w-full mt-10">
        <SocialLogin />
      </div>
    </div>
  );
};

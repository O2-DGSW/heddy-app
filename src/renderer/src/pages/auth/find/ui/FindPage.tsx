import { useLocation } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { FindIdForm, FindPasswordForm } from "@/features/auth/find";

export const FindPage = () => {
  const { pathname } = useLocation();

  const isPassword = pathname === "/find-password";
  const title = isPassword ? "비밀번호 찾기" : "아이디 찾기";

  return (
    <div
      className="flex h-full flex-col items-center overflow-y-auto px-6 pt-23.5"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="mb-10 flex flex-col items-center gap-2">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />

        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          {title}
        </p>
      </div>

      {isPassword ? <FindPasswordForm /> : <FindIdForm />}
    </div>
  );
};

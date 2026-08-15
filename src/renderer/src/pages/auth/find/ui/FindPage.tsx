import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";
import { FindIdForm, FindPasswordForm } from "@/features/auth/find";

export const FindPage = () => {
  const { type } = useParams<{ type: string }>();
  const isPassword = type === "password";
  const title = isPassword ? "비밀번호 찾기" : "아이디 찾기";

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center px-6 pt-8"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex flex-col items-center gap-2 mb-10">
        <img src="/heddyIcon.svg" alt="heddy" className="w-50" />
        <p className={font.body.medium} style={{ color: lightTheme.label.assistive }}>
          {title}
        </p>
      </div>
      {isPassword ? <FindPasswordForm /> : <FindIdForm />}
    </div>
  );
};

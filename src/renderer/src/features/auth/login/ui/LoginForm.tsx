import { lightTheme, font } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import { useLoginForm } from "@/features/auth/login/model/login";
import { PasswordInput } from "@/shared/ui/password-input/PasswordInput";

export const LoginForm = () => {
  const { id, setId, password, setPassword, error, isLoading, handleLogin } = useLoginForm();

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1">
        <label
          className={`${font.label.medium} pl-2`}
          style={{ color: lightTheme.label.assistive }}
        >
          아이디
        </label>
        <input
          className={`w-full px-4 py-4 rounded-xl  focus:outline-none ${font.caption.regular}`}
          style={{
            backgroundColor: lightTheme.background.neutral,
            color: lightTheme.label.normal,
          }}
          placeholder="아이디"
          value={id}
          onChange={e => setId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className={`${font.label.medium} pl-2`}
          style={{ color: lightTheme.label.assistive }}
        >
          비밀번호
        </label>
        <PasswordInput placeholder="비밀번호" value={password} onChange={setPassword} />
      </div>

      <div
        className={`flex justify-center gap-2 ${font.caption.medium}`}
        style={{ color: lightTheme.label.assistive }}
      >
        <Link to="/find-id">아이디찾기</Link>
        <span>·</span>
        <Link to="/find-password">비밀번호 찾기</Link>
        <span>·</span>
        <Link to="/signup">회원가입</Link>
      </div>

      {error && (
        <p className={font.caption.regular} style={{ color: lightTheme.status.error }}>
          {error}
        </p>
      )}

      <button
        className={`w-full py-4 rounded-2xl mt-4 ${font.headline2.semiBold}`}
        style={{
          backgroundColor: lightTheme.primary.normal,
          color: lightTheme.fill.normal,
          opacity: isLoading ? 0.6 : 1,
        }}
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
    </div>
  );
};

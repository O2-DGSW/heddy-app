import { lightTheme, font } from "@heddy/design-tokens";
import GoogleIcon from "@/features/auth/login/assets/social-field/google.svg";
import KakaoIcon from "@/features/auth/login/assets/social-field/kakao.svg";
import NaverIcon from "@/features/auth/login/assets/social-field/naver.svg";
import { useSocialLogin } from "../model/socialLogin.ts";

export const SocialLogin = () => {
  const { error, pendingProvider, handleKakaoLogin, handleNaverLogin, handleGoogleLogin } =
    useSocialLogin();
  const isPending = pendingProvider !== null;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px" style={{ backgroundColor: lightTheme.line.neutral }} />
        <span className={font.caption.regular} style={{ color: lightTheme.line.neutral }}>
          또는 다음으로 로그인
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: lightTheme.line.neutral }} />
      </div>

      <div className="flex gap-6">
        <button
          type="button"
          aria-busy={pendingProvider === "kakao"}
          disabled={isPending}
          onClick={handleKakaoLogin}
        >
          <img src={KakaoIcon} alt="카카오 로그인" className="size-12" />
        </button>

        <button
          type="button"
          aria-busy={pendingProvider === "naver"}
          disabled={isPending}
          onClick={handleNaverLogin}
        >
          <img src={NaverIcon} alt="네이버 로그인" className="size-12" />
        </button>

        <button
          type="button"
          aria-busy={pendingProvider === "google"}
          disabled={isPending}
          onClick={handleGoogleLogin}
        >
          <img src={GoogleIcon} alt="구글 로그인" className="size-12" />
        </button>
      </div>

      {error && (
        <p className={font.caption.regular} style={{ color: lightTheme.status.error }}>
          {error}
        </p>
      )}
    </div>
  );
};

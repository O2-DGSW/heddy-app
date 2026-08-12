import { lightTheme, font } from "@heddy/design-tokens";
import GoogleIcon from "@/features/auth/login/assets/social-field/google.svg";
import KakaoIcon from "@/features/auth/login/assets/social-field/kakao.svg";
import NaverIcon from "@/features/auth/login/assets/social-field/naver.svg";
import { useSocialLogin } from "../model/socialLogin.ts";

export const SocialLogin = () => {
  const { handleKakaoLogin, handleNaverLogin, handleGoogleLogin } = useSocialLogin();

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
        <button onClick={handleKakaoLogin}>
          <img src={KakaoIcon} alt="카카오 로그인" className="size-12" />
        </button>

        <button onClick={handleNaverLogin}>
          <img src={NaverIcon} alt="네이버 로그인" className="size-12" />
        </button>

        <button onClick={handleGoogleLogin}>
          <img src={GoogleIcon} alt="구글 로그인" className="size-12" />
        </button>
      </div>
    </div>
  );
};

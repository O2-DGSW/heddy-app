import { useState } from "react";

type SocialProviderType = "kakao" | "naver" | "google";

const SOCIAL_LOGIN_PATHS: Record<SocialProviderType, string> = {
  kakao: "/oauth2/authorization/kakao",
  naver: "/oauth2/authorization/naver",
  google: "/oauth2/authorization/google",
};

const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const useSocialLogin = () => {
  const [pendingProvider, setPendingProvider] = useState<SocialProviderType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSocialLogin = (provider: SocialProviderType) => {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
      setError("소셜 로그인 서버 주소가 설정되어 있지 않습니다.");
      return;
    }

    setError(null);
    setPendingProvider(provider);
    window.location.assign(new URL(SOCIAL_LOGIN_PATHS[provider], apiBaseUrl).toString());
  };

  const handleKakaoLogin = () => {
    startSocialLogin("kakao");
  };

  const handleNaverLogin = () => {
    startSocialLogin("naver");
  };

  const handleGoogleLogin = () => {
    startSocialLogin("google");
  };

  return {
    error,
    pendingProvider,
    handleKakaoLogin,
    handleNaverLogin,
    handleGoogleLogin,
  };
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { loginApi, setAuthTokens } from "@/entities/auth";
import { generateRecommendationApi, recommendationQueryKeys } from "@/entities/recommendation";

export const useLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await loginApi({ email: trimmedEmail, password });
      await setAuthTokens({ accessToken, refreshToken });
      queryClient.clear();
      // 로그인마다 한 번 새 추천을 만들고, 홈의 최신 추천 조회와 같은 진행 중 요청을 공유한다.
      // prefetch는 오류를 외부로 던지지 않아 추천 생성 실패가 로그인 성공을 막지 않는다.
      void queryClient.prefetchQuery({
        queryKey: recommendationQueryKeys.latest(),
        queryFn: () => generateRecommendationApi({ force_refresh: true }),
        retry: false,
      });
      navigate("/home", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, isLoading, handleLogin };
};

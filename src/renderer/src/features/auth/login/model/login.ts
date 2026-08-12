import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginApi } from "@/entities/auth/api/authApi";
import { setAuthTokens } from "@/entities/auth/model/token";
import { queryClient } from "@/app/queryClient";

export const useLoginForm = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await loginApi({ loginId: id, password });
      await setAuthTokens({ accessToken, refreshToken });
      queryClient.clear();
      navigate("/");
    } catch (err) {
      console.error("로그인 실패:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { id, setId, password, setPassword, error, isLoading, handleLogin };
};

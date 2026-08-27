import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginApi, setAuthTokens } from "@/entities/auth";
import { queryClient } from "@/app/queryClient";

export const useLoginForm = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    const trimmedId = id.trim();

    if (!trimmedId || !password) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const { accessToken, refreshToken } = await loginApi({ loginId: trimmedId, password });
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { clearAuthTokens, getRefreshToken, logoutApi } from "@/entities/auth";

const getLogoutErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "로그아웃에 실패했습니다. 다시 시도해주세요.";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    if (isPending) {
      return;
    }

    setErrorMessage(null);
    setIsPending(true);

    try {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        throw new Error("로그인 정보가 없습니다. 다시 로그인해주세요.");
      }

      await logoutApi(refreshToken);
      await clearAuthTokens();
      queryClient.clear();
      navigate("/login", { replace: true });
    } catch (error) {
      setErrorMessage(getLogoutErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return { errorMessage, handleLogout, isPending };
};

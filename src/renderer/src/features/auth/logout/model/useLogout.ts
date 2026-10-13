import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { clearAuthTokens, getRefreshToken, logoutApi } from "@/entities/auth";

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  /** 서버 로그아웃이 실패해도 기기의 토큰과 캐시는 항상 지운다 */
  const handleLogout = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // 서버 세션은 만료 시간이 지나면 정리된다. 사용자에게는 로그아웃된 상태가 중요하다.
    } finally {
      await clearAuthTokens();
      queryClient.clear();
      setIsPending(false);
      navigate("/login", { replace: true });
    }
  };

  return { handleLogout, isPending };
};

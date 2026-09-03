import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { clearAuthTokens, reauthenticateApi } from "@/entities/auth";
import { deleteMyAccountApi } from "@/entities/profile";
import { showErrorToast, showSuccessToast } from "@/shared";

interface UseDeleteAccountParams {
  onClose: () => void;
}

export const useDeleteAccount = ({ onClose }: UseDeleteAccountParams) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleDeleteAccount = async () => {
    if (isPending) {
      return;
    }

    if (!password) {
      showErrorToast("회원 탈퇴를 위해 비밀번호를 입력해주세요.");
      return;
    }

    setIsPending(true);

    try {
      const reauthentication = await reauthenticateApi({ method: "PASSWORD", password });

      await deleteMyAccountApi({
        reauthentication_token: reauthentication.reauthentication_token,
      });
      await clearAuthTokens();
      queryClient.clear();
      onClose();
      navigate("/welcome", { replace: true });
      showSuccessToast("회원 탈퇴 요청이 접수되었어요.");
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : "회원 탈퇴를 요청하지 못했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleDeleteAccount,
    isPending,
    password,
    setPassword,
  };
};

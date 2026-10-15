import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { showErrorToast } from "@/shared";

import { subscribeSessionExpired } from "./sessionExpiry";

/** 세션이 만료되면 안내를 띄우고 로그인 화면으로 보낸다. 인터셉터는 라우터 밖이라 여기서 이동한다 */
const SessionExpiryListener = () => {
  const navigate = useNavigate();

  useEffect(
    () =>
      subscribeSessionExpired(() => {
        showErrorToast("로그인이 만료됐어요. 다시 로그인해주세요.");
        navigate("/login", { replace: true });
      }),
    [navigate]
  );

  return null;
};

export default SessionExpiryListener;

import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { setupRouterOutlet } from "@capgo/capacitor-transitions/react";

/**
 * AR 확대 메뉴에서 이동하는 주요 화면 전용 라우트 전환 컨테이너
 * - 시술기록의 추가 화면과 동일하게 cap-router-outlet이 화면 본문을 슬라이드 전환한다.
 */
export const MainTransitionOutlet = () => {
  const outletRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (outletRef.current) {
      setupRouterOutlet(outletRef.current, { platform: "auto", swipeGesture: "auto" });
    }
  }, []);

  return (
    <cap-router-outlet ref={outletRef}>
      <Outlet />
    </cap-router-outlet>
  );
};

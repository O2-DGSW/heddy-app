import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { setupRouterOutlet } from "@capgo/capacitor-transitions/react";

import { initCapgoTransitions } from "./initCapgoTransitions";

// 앱 시작 시 한 번만 초기화하면 되므로 모듈 스코프에서 호출한다.
initCapgoTransitions();

/**
 * AR 확대 메뉴와 시술기록이 공유하는 라우트 전환 컨테이너
 * - 두 경로가 같은 cap-router-outlet 안에 있어야 경로 간 슬라이드 전환이 유지된다.
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

import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { initTransitions, setupRouterOutlet } from "@capgo/capacitor-transitions/react";
import "@capgo/capacitor-transitions";

// 앱 시작 시 한 번만 초기화하면 되므로 모듈 스코프에서 호출한다.
initTransitions({ platform: "auto" });

/**
 * 시술기록(/cuts) 구간 전용 라우트 전환 컨테이너
 * - cap-router-outlet이 push/pop 시 iOS 스타일 슬라이드 애니메이션과
 *   엣지 스와이프 뒤로가기(swipeGesture: "auto", 네이티브 iOS에서만 자동 활성화)를 담당한다.
 */
export const CutsTransitionOutlet = () => {
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

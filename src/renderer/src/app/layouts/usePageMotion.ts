import { useEffect, type RefObject } from "react";
import { setupRouterOutlet } from "@capgo/capacitor-transitions/react";

import { MAX_CACHED_PAGES, initCapgoTransitions } from "./initCapgoTransitions";

export const PAGE_TRANSITION_DURATION_MS = 320;

initCapgoTransitions();

/** 플랫폼별 페이드 차이 없이 방향 있는 슬라이드와 동작 줄이기 설정을 적용한다. */
export const usePageMotion = (ref: RefObject<HTMLElement | null>, keepInDom = false) => {
  useEffect(() => {
    const outlet = ref.current;
    if (!outlet) return;
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const update = () => {
      setupRouterOutlet(outlet, {
        platform: "ios",
        // 라이브러리는 0을 기본 시간으로 되돌리므로 1ms로 사실상 즉시 전환한다.
        duration: media?.matches ? 1 : PAGE_TRANSITION_DURATION_MS,
        maxCached: MAX_CACHED_PAGES,
        keepInDom,
        swipeGesture: media?.matches ? false : "auto",
      });
    };
    update();
    media?.addEventListener("change", update);
    return () => media?.removeEventListener("change", update);
  }, [ref, keepInDom]);
};

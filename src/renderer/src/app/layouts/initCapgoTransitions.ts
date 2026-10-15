import { initTransitions } from "@capgo/capacitor-transitions/react";
import "@capgo/capacitor-transitions";

/**
 * 떠난 페이지를 DOM에 남겨 두는 최대 개수. 기본값 10은 메모리를 많이 잡는다.
 * 스와이프 뒤로가기가 직전 페이지를 보여 줘야 하므로 0으로 두지는 않는다.
 */
export const MAX_CACHED_PAGES = 3;

let isCapgoTransitionsInitialized = false;

export const initCapgoTransitions = () => {
  if (isCapgoTransitionsInitialized) {
    return;
  }

  initTransitions({ platform: "auto" });
  isCapgoTransitionsInitialized = true;
};

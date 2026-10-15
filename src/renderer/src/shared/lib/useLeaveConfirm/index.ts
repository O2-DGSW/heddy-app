import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface UseLeaveConfirmOptions {
  /** 저장하지 않은 입력이 있는지 */
  isDirty: boolean;
  /** 화면 안의 아무 요소. 가장 가까운 전환 outlet을 찾아 스와이프 뒤로가기를 끈다 */
  containerRef: RefObject<HTMLElement | null>;
  /** 실제로 화면을 떠나는 동작(보통 navigate(-1)) */
  onLeave: () => void;
}

interface UseLeaveConfirmResult {
  isLeaveConfirmOpen: boolean;
  /** 닫기·뒤로 버튼에 연결한다. 입력이 없으면 바로 떠나고, 있으면 확인 창을 연다 */
  requestLeave: () => void;
  confirmLeave: () => void;
  cancelLeave: () => void;
}

const SWIPE_GESTURE_ATTRIBUTE = "swipe-gesture";

/**
 * 작성 중에 화면을 나가면 입력이 그대로 버려지므로 한 번 되묻는다.
 * - 닫기·뒤로 버튼: requestLeave로 확인 창을 띄운다.
 * - Android 뒤로가기: 입력이 있는 동안만 가로채 확인 창을 띄운다.
 * - iOS 엣지 스와이프: 제스처 도중에는 되물을 수 없어, 입력이 있는 동안 스와이프 뒤로가기를 끈다.
 */
export const useLeaveConfirm = ({
  isDirty,
  containerRef,
  onLeave,
}: UseLeaveConfirmOptions): UseLeaveConfirmResult => {
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const onLeaveRef = useRef(onLeave);

  const requestLeave = useCallback(() => {
    if (isDirty) {
      setIsLeaveConfirmOpen(true);
      return;
    }

    onLeaveRef.current();
  }, [isDirty]);

  const confirmLeave = useCallback(() => {
    setIsLeaveConfirmOpen(false);
    onLeaveRef.current();
  }, []);

  const cancelLeave = useCallback(() => {
    setIsLeaveConfirmOpen(false);
  }, []);

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    const outlet = containerRef.current?.closest("cap-router-outlet");

    if (!isDirty || !outlet) {
      return;
    }

    const previousValue = outlet.getAttribute(SWIPE_GESTURE_ATTRIBUTE);
    outlet.setAttribute(SWIPE_GESTURE_ATTRIBUTE, "false");

    return () => {
      // 속성이 없던 상태로 돌리면 outlet 설정값(auto)이 다시 적용된다.
      if (previousValue === null) {
        outlet.removeAttribute(SWIPE_GESTURE_ATTRIBUTE);
      } else {
        outlet.setAttribute(SWIPE_GESTURE_ATTRIBUTE, previousValue);
      }
    };
  }, [containerRef, isDirty]);

  useEffect(() => {
    if (!isDirty || Capacitor.getPlatform() !== "android") {
      return;
    }

    // 리스너가 있는 동안에는 Capacitor 기본 뒤로가기가 멈춘다. 입력이 없어지면 바로 뗀다.
    const listener = App.addListener("backButton", () => {
      setIsLeaveConfirmOpen(true);
    });

    return () => {
      void listener.then(handle => handle.remove());
    };
  }, [isDirty]);

  return { isLeaveConfirmOpen, requestLeave, confirmLeave, cancelLeave };
};

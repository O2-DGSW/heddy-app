import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { HAIRSTYLE_STEP_DISTANCE } from "./hairstyleCarouselLayout";

interface UseHairstyleCarouselOptions {
  activeHairstylePosition: number;
  itemCount: number;
  loadingMessage: string | null;
  disabled: boolean;
  onSelect: (position: number) => void;
  onDisabledSelect?: () => void;
}

const CLICK_SUPPRESSION_DISTANCE = 8;
const WHEEL_SETTLE_DELAY = 120;

export const useHairstyleCarousel = ({
  activeHairstylePosition,
  itemCount,
  loadingMessage,
  disabled,
  onSelect,
  onDisabledSelect,
}: UseHairstyleCarouselOptions) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(activeHairstylePosition);
  const animationRef = useRef<number | null>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchCleanupRef = useRef<(() => void) | null>(null);
  const pointerRef = useRef<{
    input: "pointer" | "touch";
    id: number;
    startX: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const callbacksRef = useRef({ onSelect, onDisabledSelect });
  const [position, setPosition] = useState(activeHairstylePosition);
  const centerPosition = Math.round(position);

  const stopAnimation = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    if (wheelTimerRef.current !== null) clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = null;
  }, []);

  const animateTo = useCallback(
    (target: number, commit = true) => {
      stopAnimation();
      let previousTime = performance.now();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tick = (time: number) => {
        const elapsed = Math.min(64, time - previousTime);
        previousTime = time;
        const remaining = target - positionRef.current;
        const finished = reducedMotion || Math.abs(remaining) < 0.002;
        const next = finished
          ? target
          : positionRef.current + remaining * (1 - Math.exp(-elapsed / 65));
        positionRef.current = next;
        setPosition(next);
        if (finished) {
          animationRef.current = null;
          if (commit) callbacksRef.current.onSelect(target);
        } else {
          animationRef.current = requestAnimationFrame(tick);
        }
      };
      animationRef.current = requestAnimationFrame(tick);
    },
    [stopAnimation]
  );

  const paintPosition = useCallback((next: number) => {
    positionRef.current = next;
    if (animationRef.current !== null) return;
    animationRef.current = requestAnimationFrame(() => {
      animationRef.current = null;
      setPosition(positionRef.current);
    });
  }, []);

  const moveGesture = useCallback(
    (clientX: number, timeStamp: number) => {
      const pointer = pointerRef.current;
      if (!pointer) return;
      const distance = pointer.lastX - clientX;
      if (Math.abs(pointer.startX - clientX) >= CLICK_SUPPRESSION_DISTANCE) {
        suppressClickRef.current = true;
      }
      if (!suppressClickRef.current) return;
      const elapsed = Math.max(1, timeStamp - pointer.lastTime);
      pointer.velocity = distance / HAIRSTYLE_STEP_DISTANCE / elapsed;
      pointer.lastX = clientX;
      pointer.lastTime = timeStamp;
      paintPosition(positionRef.current + distance / HAIRSTYLE_STEP_DISTANCE);
    },
    [paintPosition]
  );

  const finishGesture = useCallback(
    (timeStamp: number) => {
      const pointer = pointerRef.current;
      if (!pointer) return;
      pointerRef.current = null;
      if (!suppressClickRef.current) return;
      const velocity = timeStamp - pointer.lastTime < 80 ? pointer.velocity : 0;
      // 손을 뗀 속도만큼 더 이동한 뒤 가장 가까운 스타일에 정렬한다.
      const momentum = Math.max(-4, Math.min(4, velocity * 180));
      animateTo(Math.round(positionRef.current + momentum));
    },
    [animateTo]
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // 손가락 입력은 아래 native Touch Events 경로 하나로만 처리한다.
    if (
      event.pointerType === "touch" ||
      event.button !== 0 ||
      !event.isPrimary ||
      pointerRef.current
    )
      return;
    if (disabled) {
      onDisabledSelect?.();
      return;
    }
    stopAnimation();
    suppressClickRef.current = false;
    pointerRef.current = {
      input: "pointer",
      id: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (pointer?.input !== "pointer" || pointer.id !== event.pointerId) return;
    if (
      !suppressClickRef.current &&
      Math.abs(pointer.startX - event.clientX) >= CLICK_SUPPRESSION_DISTANCE
    ) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    moveGesture(event.clientX, event.timeStamp);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (pointer?.input !== "pointer" || pointer.id !== event.pointerId) return;
    finishGesture(event.timeStamp);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current?.input !== "pointer" || pointerRef.current.id !== event.pointerId)
      return;
    pointerRef.current = null;
    animateTo(Math.round(positionRef.current));
  };

  const handleLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    // 터치 캡처가 자식 버튼에서 캐러셀로 이동할 때 버블링되는 해제 이벤트는 무시한다.
    if (event.target !== event.currentTarget) return;
    handlePointerCancel(event);
  };

  const handleSelect = (nextPosition: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (disabled) {
      onDisabledSelect?.();
      return;
    }
    animateTo(nextPosition);
  };

  useEffect(() => {
    callbacksRef.current = { onSelect, onDisabledSelect };
  }, [onSelect, onDisabledSelect]);

  useEffect(() => {
    pointerRef.current = null;
    animateTo(activeHairstylePosition, false);
    return stopAnimation;
  }, [activeHairstylePosition, disabled, animateTo, stopAnimation]);

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (delta === 0) return;
      event.preventDefault();
      if (disabled) {
        callbacksRef.current.onDisabledSelect?.();
        return;
      }
      stopAnimation();
      touchCleanupRef.current?.();
      pointerRef.current = null;
      suppressClickRef.current = false;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      paintPosition(positionRef.current + (delta * unit) / HAIRSTYLE_STEP_DISTANCE);
      wheelTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null;
        animateTo(Math.round(positionRef.current));
      }, WHEEL_SETTLE_DELAY);
    };
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchCleanupRef.current?.();
        if (pointerRef.current?.input === "touch") {
          pointerRef.current = null;
          animateTo(activeHairstylePosition, false);
        }
        return;
      }
      if (pointerRef.current) return;
      if (disabled) {
        callbacksRef.current.onDisabledSelect?.();
        return;
      }
      const touch = event.touches[0];
      if (!touch) return;
      stopAnimation();
      suppressClickRef.current = false;
      pointerRef.current = {
        input: "touch",
        id: touch.identifier,
        startX: touch.clientX,
        lastX: touch.clientX,
        lastTime: event.timeStamp,
        velocity: 0,
      };
      // 이동 중 원래 썸네일이 DOM에서 제거되어도 touch의 대상은 바뀌지 않는다.
      // 원래 대상에 직접 연결해 캡처 이전·버블링·썸네일 교체에 의존하지 않는다.
      const target = event.target instanceof HTMLElement ? event.target : element;
      const cleanupTouch = () => {
        target.removeEventListener("touchmove", handleTouchMove);
        target.removeEventListener("touchend", handleTouchEnd);
        target.removeEventListener("touchcancel", handleTouchCancel);
        touchCleanupRef.current = null;
      };
      const handleTouchCancel = () => {
        cleanupTouch();
        pointerRef.current = null;
        animateTo(activeHairstylePosition, false);
      };
      const handleTouchMove = (move: TouchEvent) => {
        const pointer = pointerRef.current;
        if (pointer?.input !== "touch") return;
        const current = Array.from(move.touches).find(item => item.identifier === pointer.id);
        if (move.touches.length !== 1 || !current) {
          handleTouchCancel();
          return;
        }
        moveGesture(current.clientX, move.timeStamp);
        // React의 touchmove는 passive이므로 native 리스너에서 스크롤·호환 클릭을 막는다.
        if (suppressClickRef.current && move.cancelable) move.preventDefault();
      };
      const handleTouchEnd = (end: TouchEvent) => {
        const pointer = pointerRef.current;
        if (pointer?.input !== "touch") return;
        if (!Array.from(end.changedTouches).some(item => item.identifier === pointer.id)) return;
        if (end.touches.length !== 0) {
          handleTouchCancel();
          return;
        }
        cleanupTouch();
        finishGesture(end.timeStamp);
      };
      touchCleanupRef.current = cleanupTouch;
      target.addEventListener("touchmove", handleTouchMove, { passive: false });
      target.addEventListener("touchend", handleTouchEnd);
      target.addEventListener("touchcancel", handleTouchCancel);
    };
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    // React의 passive wheel 리스너 대신 캐러셀 안에서만 기본 스크롤을 막는다.
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      touchCleanupRef.current?.();
      if (pointerRef.current?.input === "touch") pointerRef.current = null;
      stopAnimation();
    };
  }, [
    disabled,
    loadingMessage,
    itemCount,
    activeHairstylePosition,
    animateTo,
    paintPosition,
    stopAnimation,
    moveGesture,
    finishGesture,
  ]);

  return {
    carouselRef,
    position,
    centerPosition,
    handleSelect,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  };
};

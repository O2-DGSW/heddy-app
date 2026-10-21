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
  const pointerRef = useRef<{
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || pointerRef.current) return;
    if (disabled) {
      onDisabledSelect?.();
      return;
    }
    stopAnimation();
    suppressClickRef.current = false;
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const distance = pointer.lastX - event.clientX;
    if (
      !suppressClickRef.current &&
      Math.abs(pointer.startX - event.clientX) >= CLICK_SUPPRESSION_DISTANCE
    ) {
      suppressClickRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!suppressClickRef.current) return;
    const elapsed = Math.max(1, event.timeStamp - pointer.lastTime);
    const movement = distance / HAIRSTYLE_STEP_DISTANCE;
    pointer.velocity = movement / elapsed;
    pointer.lastX = event.clientX;
    pointer.lastTime = event.timeStamp;
    paintPosition(positionRef.current + movement);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    pointerRef.current = null;
    if (!suppressClickRef.current) return;
    const velocity = event.timeStamp - pointer.lastTime < 80 ? pointer.velocity : 0;
    // 손을 뗀 속도만큼 더 이동한 뒤 가장 가까운 스타일에 정렬한다.
    const momentum = Math.max(-4, Math.min(4, velocity * 180));
    animateTo(Math.round(positionRef.current + momentum));
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current?.id !== event.pointerId) return;
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
      pointerRef.current = null;
      suppressClickRef.current = false;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      paintPosition(positionRef.current + (delta * unit) / HAIRSTYLE_STEP_DISTANCE);
      wheelTimerRef.current = setTimeout(() => {
        wheelTimerRef.current = null;
        animateTo(Math.round(positionRef.current));
      }, WHEEL_SETTLE_DELAY);
    };
    // React의 passive wheel 리스너 대신 캐러셀 안에서만 기본 스크롤을 막는다.
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
      stopAnimation();
    };
  }, [disabled, loadingMessage, itemCount, animateTo, paintPosition, stopAnimation]);

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

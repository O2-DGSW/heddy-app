import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const HALF_HEIGHT = 52;
const EXPANDED_HEIGHT = 88;
const SNAP_DISTANCE = 4;

export const useArHairstyleSheet = (onClose: () => void) => {
  const sheetRef = useRef<HTMLElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ id: number; y: number; height: number; containerHeight: number } | null>(
    null
  );
  const frameRef = useRef<number | null>(null);
  const pendingHeightRef = useRef(HALF_HEIGHT);
  const suppressClickRef = useRef(false);
  const [height, setHeight] = useState(HALF_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const isExpanded = height > (HALF_HEIGHT + EXPANDED_HEIGHT) / 2;

  const cancelFrame = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };
  const settleHeight = (nextHeight: number) => {
    cancelFrame();
    const sheet = sheetRef.current;
    if (sheet) {
      // 드래그 중에는 즉시 따라오고, 손을 놓은 뒤에만 CSS 전환을 복원한다.
      sheet.style.removeProperty("transition");
      sheet.getBoundingClientRect();
      sheet.style.height = `${nextHeight}%`;
    }
    setHeight(nextHeight);
    setIsDragging(false);
  };
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || event.isPrimary === false || dragRef.current) return;
    const sheet = sheetRef.current;
    const containerHeight = sheet?.parentElement?.getBoundingClientRect().height;
    if (!sheet || !containerHeight) return;
    cancelFrame();
    // 스냅 애니메이션 도중 다시 잡아도 현재 보이는 위치에서 이어서 움직인다.
    const visibleHeight = (sheet.getBoundingClientRect().height / containerHeight) * 100 || height;
    sheet.style.transition = "none";
    sheet.style.height = `${visibleHeight}%`;
    suppressClickRef.current = false;
    dragRef.current = {
      id: event.pointerId,
      y: event.clientY,
      height: visibleHeight,
      containerHeight,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientY - drag.y;
    if (Math.abs(delta) > 6) suppressClickRef.current = true;
    pendingHeightRef.current = Math.min(
      EXPANDED_HEIGHT,
      Math.max(20, drag.height - (delta / drag.containerHeight) * 100)
    );
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (sheetRef.current) sheetRef.current.style.height = `${pendingHeightRef.current}%`;
    });
  };
  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientY - drag.y;
    const movement = (-delta / drag.containerHeight) * 100;
    const nextHeight = drag.height + movement;
    suppressClickRef.current = Math.abs(delta) > 6 || suppressClickRef.current;
    dragRef.current = null;
    if (nextHeight < 36) {
      settleHeight(HALF_HEIGHT);
      onClose();
      return;
    }
    // 짧고 명확한 위/아래 제스처도 다음 위치로 이동시킨다.
    const target =
      Math.abs(movement) >= SNAP_DISTANCE
        ? movement > 0
          ? EXPANDED_HEIGHT
          : HALF_HEIGHT
        : nextHeight > 70
          ? EXPANDED_HEIGHT
          : HALF_HEIGHT;
    settleHeight(target);
  };
  const handlePointerCancel = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    suppressClickRef.current = true;
    settleHeight(drag.height > 70 ? EXPANDED_HEIGHT : HALF_HEIGHT);
  };
  const handleToggle = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    settleHeight(isExpanded ? HALF_HEIGHT : EXPANDED_HEIGHT);
  };
  const handleHandleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") suppressClickRef.current = false;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      settleHeight(event.key === "ArrowUp" ? EXPANDED_HEIGHT : HALF_HEIGHT);
    }
  };
  const handleSheetKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      sheetRef.current?.querySelectorAll<HTMLElement>(
        'button, summary, [href], input, select, textarea, [tabindex="0"]'
      ) ?? []
    ).filter(element => !element.hasAttribute("disabled") && element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && event.target === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  useEffect(() => {
    const previousFocus = document.activeElement;
    handleRef.current?.focus();
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);

  return {
    sheetRef,
    handleRef,
    height,
    isDragging,
    isExpanded,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleToggle,
    handleHandleKeyDown,
    handleSheetKeyDown,
  };
};

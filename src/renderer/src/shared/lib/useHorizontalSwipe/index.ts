import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from "react";

/** @capgo/capacitor-transitions의 엣지 스와이프 뒤로가기가 잡는 왼쪽 영역(px) */
const EDGE_BACK_GESTURE_WIDTH = 50;
/** 이만큼 움직인 시점에 가로/세로 중 어느 축의 제스처인지 확정한다 */
const AXIS_LOCK_THRESHOLD = 10;
/** 스와이프로 인정할 최소 가로 이동 거리(px) */
const DEFAULT_MIN_DISTANCE = 60;

type SwipeAxis = "none" | "horizontal" | "vertical";

interface UseHorizontalSwipeOptions {
  /** 왼쪽으로 밀었을 때(다음 항목) */
  onSwipeLeft: () => void;
  /** 오른쪽으로 밀었을 때(이전 항목) */
  onSwipeRight: () => void;
  minDistance?: number;
}

export interface HorizontalSwipeProps {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onClickCapture: (event: MouseEvent<HTMLElement>) => void;
  style: CSSProperties;
}

/**
 * 가로 스와이프 제스처를 감지해 좌우 이동 콜백을 실행한다.
 * - 세로 스크롤을 막지 않도록 처음 움직인 방향으로 축을 확정하고, 세로면 제스처를 포기한다.
 * - 화면 왼쪽 끝에서 시작한 제스처는 엣지 스와이프 뒤로가기 몫이라 건드리지 않는다.
 * - 스와이프 직후 카드 클릭이 같이 발생하지 않도록 이어지는 click 한 번을 막는다.
 */
export const useHorizontalSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  minDistance = DEFAULT_MIN_DISTANCE,
}: UseHorizontalSwipeOptions): HorizontalSwipeProps => {
  const gesture = useRef({
    startX: 0,
    startY: 0,
    isTracking: false,
    axis: "none" as SwipeAxis,
    shouldSuppressClick: false,
  });

  const reset = () => {
    gesture.current.isTracking = false;
    gesture.current.axis = "none";
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    const startXInElement = event.clientX - event.currentTarget.getBoundingClientRect().left;

    if (!event.isPrimary || startXInElement <= EDGE_BACK_GESTURE_WIDTH) {
      reset();
      return;
    }

    gesture.current.startX = event.clientX;
    gesture.current.startY = event.clientY;
    gesture.current.isTracking = true;
    gesture.current.axis = "none";
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!gesture.current.isTracking || gesture.current.axis === "vertical") {
      return;
    }

    const deltaX = event.clientX - gesture.current.startX;
    const deltaY = event.clientY - gesture.current.startY;

    if (gesture.current.axis === "none") {
      if (Math.abs(deltaX) < AXIS_LOCK_THRESHOLD && Math.abs(deltaY) < AXIS_LOCK_THRESHOLD) {
        return;
      }

      // 세로가 더 크면 스크롤이므로 이번 제스처는 넘긴다.
      gesture.current.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!gesture.current.isTracking || gesture.current.axis !== "horizontal") {
      reset();
      return;
    }

    const deltaX = event.clientX - gesture.current.startX;

    // 가로로 움직인 제스처였다면 거리가 모자라 탭이 안 넘어가더라도 클릭으로 이어지면 안 된다.
    gesture.current.shouldSuppressClick = true;

    if (Math.abs(deltaX) >= minDistance) {
      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }

    reset();
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!gesture.current.shouldSuppressClick) {
      return;
    }

    gesture.current.shouldSuppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: reset,
    onClickCapture: handleClickCapture,
    // 세로 스크롤은 브라우저에 맡기고 가로 움직임만 우리가 처리한다.
    style: { touchAction: "pan-y" },
  };
};

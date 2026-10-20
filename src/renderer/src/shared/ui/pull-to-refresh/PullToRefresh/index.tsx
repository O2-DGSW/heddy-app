import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared/lib";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  resetKey: string;
}

interface PullState {
  routeKey: string;
  distance: number;
  refreshing: boolean;
  failed: boolean;
  left: number;
  top: number;
}

const REFRESH_DISTANCE = 64;
const MAX_PULL_DISTANCE = 96;
const IGNORED_TARGETS =
  'input, textarea, select, [contenteditable="true"], [role="slider"], [role="dialog"], nav';

const isAtScrollTop = (target: Element, boundary: HTMLElement): boolean => {
  let element: Element | null = target;
  while (element) {
    if (element.scrollTop > 0) return false;
    if (element === boundary) return true;
    element = element.parentElement;
  }
  return false;
};

const PullToRefresh = ({ children, onRefresh, resetKey }: PullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef(onRefresh);
  const [state, setState] = useState<PullState>({
    routeKey: resetKey,
    distance: 0,
    refreshing: false,
    failed: false,
    left: 0,
    top: 0,
  });
  const visible =
    state.routeKey === resetKey && (state.distance > 0 || state.refreshing || state.failed);
  const ready = state.distance >= REFRESH_DISTANCE;
  const message = state.refreshing
    ? "새로고침 중이에요"
    : state.failed
      ? "불러오지 못했어요. 다시 당겨 주세요"
      : ready
        ? "놓으면 새로고침해요"
        : "아래로 당겨 새로고침";

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let start: { x: number; y: number; target: Element } | null = null;
    let distance = 0;
    let refreshing = false;
    let disposed = false;
    let errorTimer: ReturnType<typeof setTimeout> | undefined;

    const resetGesture = () => {
      start = null;
      distance = 0;
      setState(current => ({ ...current, distance: 0 }));
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        resetGesture();
        return;
      }
      const touch = event.touches[0];
      const target = event.target;
      if (
        refreshing ||
        !touch ||
        !(target instanceof Element) ||
        target.closest(IGNORED_TARGETS) ||
        !isAtScrollTop(target, container)
      )
        return;
      clearTimeout(errorTimer);
      start = { x: touch.clientX, y: touch.clientY, target };
      distance = 0;
      // 루트 바깥에 그리는 표시도 실제 페이지의 위치를 기준으로 맞춘다(웹 휴대폰 프레임 포함).
      const bounds = (target.closest("cap-page, main") ?? container).getBoundingClientRect();
      setState({
        routeKey: resetKey,
        distance: 0,
        refreshing: false,
        failed: false,
        left: bounds.left + bounds.width / 2,
        top: Math.max(0, bounds.top) + 12,
      });
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!start || refreshing) return;
      if (event.touches.length !== 1 || !touch || !isAtScrollTop(start.target, container)) {
        resetGesture();
        return;
      }
      const deltaY = touch.clientY - start.y;
      if (deltaY <= 0 || Math.abs(touch.clientX - start.x) > deltaY) {
        resetGesture();
        return;
      }
      if (event.cancelable) event.preventDefault();
      distance = Math.min(MAX_PULL_DISTANCE, deltaY / 2);
      setState(current => ({ ...current, distance }));
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        resetGesture();
        return;
      }
      if (!start || refreshing) return;
      const shouldRefresh = distance >= REFRESH_DISTANCE;
      resetGesture();
      if (!shouldRefresh) return;
      refreshing = true;
      setState(current => ({ ...current, refreshing: true }));
      void Promise.resolve()
        .then(() => refreshRef.current())
        .catch(() => {
          if (disposed) return;
          setState(current => ({ ...current, failed: true }));
          errorTimer = setTimeout(() => {
            if (!disposed) setState(current => ({ ...current, failed: false }));
          }, 4000);
        })
        .finally(() => {
          if (disposed) return;
          refreshing = false;
          setState(current => ({ ...current, refreshing: false }));
        });
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    // 브라우저의 전체 페이지 새로고침 대신 내부 조회만 갱신한다.
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", resetGesture);
    return () => {
      disposed = true;
      clearTimeout(errorTimer);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", resetGesture);
    };
  }, [resetKey]);

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto overscroll-contain">
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none fixed z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 shadow-sm",
            font.caption.medium
          )}
          style={{
            left: state.left,
            top: state.top + Math.min(state.distance, 40),
            backgroundColor: lightTheme.background.normal,
            borderColor: lightTheme.line.alternative,
            color: state.failed ? lightTheme.status.error : lightTheme.primary.normal,
          }}
        >
          {state.refreshing && (
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
            />
          )}
          {message}
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;

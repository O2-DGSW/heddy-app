import { useEffect, useRef, useState } from "react";
import type { TouchEvent, WheelEvent } from "react";
import { lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import noStyleIcon from "../../assets/no-style.svg";
import {
  getCircularHairstyleOption,
  getHairstyleItemLeft,
  getHairstyleSize,
  HAIRSTYLE_VISIBLE_OFFSETS,
} from "../../model/constants";
import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";

interface ArHairstyleCarouselProps {
  activeHairstylePosition: number;
  hairstyleOptions: ArHairstyleOption[];
  loadingMessage: string | null;
  disabled: boolean;
  onSelect: (hairstyleName: HairstyleOptionId) => void;
  /** 고를 수 없는 상태에서 누르거나 넘겼을 때. 아무 반응이 없으면 고장 난 것처럼 보여 이유를 알린다 */
  onDisabledSelect: () => void;
}

// 가운데(가장 큰) 칸 크기. 모든 칸을 이 크기로 두고 scale로 줄여 레이아웃 없이 애니메이션한다.
const HAIRSTYLE_BASE_SIZE = getHairstyleSize(0);
const HAIRSTYLE_CENTER = getHairstyleItemLeft(0) + HAIRSTYLE_BASE_SIZE / 2;
const HAIRSTYLE_STEP_DISTANCE =
  getHairstyleItemLeft(1) + getHairstyleSize(1) / 2 - HAIRSTYLE_CENTER;
const SCROLL_COMMIT_THRESHOLD = 0.5;
const CLICK_SUPPRESSION_DISTANCE = 8;
const WHEEL_SETTLE_DELAY = 120;

const getHairstyleVisualLayout = (offset: number) => {
  const direction = offset < 0 ? -1 : 1;
  const distance = Math.abs(offset);
  const lowerDistance = Math.floor(distance);
  const progress = distance - lowerDistance;
  const lowerOffset = direction * lowerDistance;
  const upperOffset = direction * (lowerDistance + 1);
  const lowerSize = getHairstyleSize(lowerOffset);
  const upperSize = getHairstyleSize(upperOffset);
  const lowerCenter = getHairstyleItemLeft(lowerOffset) + lowerSize / 2;
  const upperCenter = getHairstyleItemLeft(upperOffset) + upperSize / 2;

  return {
    center: lowerCenter + (upperCenter - lowerCenter) * progress,
    size: lowerSize + (upperSize - lowerSize) * progress,
  };
};

const clampScrollProgress = (progress: number) => Math.max(-1, Math.min(1, progress));

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  hairstyleOptions,
  loadingMessage,
  disabled,
  onSelect,
  onDisabledSelect,
}: ArHairstyleCarouselProps) => {
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const wheelSettleTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollProgressRef = useRef(0);
  const pendingScrollProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollProgress = (progress: number) => {
    const clampedProgress = clampScrollProgress(progress);
    scrollProgressRef.current = clampedProgress;
    pendingScrollProgressRef.current = clampedProgress;

    if (scrollFrameRef.current !== null) return;

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      setScrollProgress(pendingScrollProgressRef.current);
    });
  };

  const flushScrollProgress = (progress: number) => {
    const clampedProgress = clampScrollProgress(progress);
    scrollProgressRef.current = clampedProgress;
    pendingScrollProgressRef.current = clampedProgress;

    if (scrollFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }

    setScrollProgress(clampedProgress);
  };

  const clearWheelSettleTimeout = () => {
    if (wheelSettleTimeoutRef.current === null) return;

    window.clearTimeout(wheelSettleTimeoutRef.current);
    wheelSettleTimeoutRef.current = null;
  };

  const handleMove = (offset: -1 | 1) => {
    if (disabled) {
      onDisabledSelect();
      return;
    }
    onSelect(getCircularHairstyleOption(activeHairstylePosition + offset, hairstyleOptions).name);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    clearWheelSettleTimeout();
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    didSwipeRef.current = false;
    setIsDragging(true);
    flushScrollProgress(0);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchX = event.touches[0]?.clientX;

    if (touchStartX === null || touchX === undefined) return;

    const distance = touchStartX - touchX;

    if (Math.abs(distance) >= CLICK_SUPPRESSION_DISTANCE) {
      didSwipeRef.current = true;
    }

    updateScrollProgress(distance / HAIRSTYLE_STEP_DISTANCE);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;
    setIsDragging(false);
    flushScrollProgress(0);

    if (touchStartX === null || touchEndX === undefined) {
      return;
    }

    const progress = clampScrollProgress((touchStartX - touchEndX) / HAIRSTYLE_STEP_DISTANCE);
    didSwipeRef.current = Math.abs(touchEndX - touchStartX) >= CLICK_SUPPRESSION_DISTANCE;

    if (didSwipeRef.current) {
      window.setTimeout(() => {
        didSwipeRef.current = false;
      }, 0);
    }

    if (Math.abs(progress) >= SCROLL_COMMIT_THRESHOLD) {
      handleMove(progress > 0 ? 1 : -1);
    }
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    didSwipeRef.current = false;
    setIsDragging(false);
    flushScrollProgress(0);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (Math.abs(delta) < 1) return;

    event.preventDefault();

    if (disabled) {
      onDisabledSelect();
      return;
    }

    setIsDragging(true);
    updateScrollProgress(scrollProgressRef.current + delta / HAIRSTYLE_STEP_DISTANCE);
    clearWheelSettleTimeout();
    wheelSettleTimeoutRef.current = window.setTimeout(() => {
      const progress = scrollProgressRef.current;

      wheelSettleTimeoutRef.current = null;
      setIsDragging(false);
      flushScrollProgress(0);

      if (Math.abs(progress) >= SCROLL_COMMIT_THRESHOLD) {
        handleMove(progress > 0 ? 1 : -1);
      }
    }, WHEEL_SETTLE_DELAY);
  };

  const handleSelect = (hairstyleName: HairstyleOptionId) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    clearWheelSettleTimeout();
    setIsDragging(false);
    flushScrollProgress(0);

    if (disabled) {
      onDisabledSelect();
      return;
    }

    onSelect(hairstyleName);
  };

  useEffect(
    () => () => {
      if (wheelSettleTimeoutRef.current !== null) {
        window.clearTimeout(wheelSettleTimeoutRef.current);
      }
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    },
    []
  );

  if (loadingMessage || hairstyleOptions.length === 0) {
    return (
      <div
        aria-live="polite"
        className="flex h-[80px] w-[404px] shrink-0 items-center justify-center text-center text-[13px] text-white/80"
      >
        {loadingMessage ?? "서버에 등록된 헤어스타일이 없습니다."}
      </div>
    );
  }

  return (
    <div
      aria-label="헤어스타일 선택"
      className="relative h-[80px] w-[404px] shrink-0 touch-pan-y select-none overflow-hidden"
      onTouchCancel={handleTouchCancel}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      {HAIRSTYLE_VISIBLE_OFFSETS.map(offset => {
        const position = activeHairstylePosition + offset;
        const option = getCircularHairstyleOption(position, hairstyleOptions);
        const isSelected = offset === 0;
        const isNoStyle = option.name === "";
        const visualOffset = offset - scrollProgress;
        const { center, size } = getHairstyleVisualLayout(visualOffset);
        const isFocusable = Math.abs(offset) <= 2;
        const translateX = center - HAIRSTYLE_BASE_SIZE / 2;

        return (
          <div
            className={cn(
              "absolute left-0 top-1/2 will-change-transform",
              !isDragging &&
                "transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            )}
            key={position}
            style={{
              height: HAIRSTYLE_BASE_SIZE,
              width: HAIRSTYLE_BASE_SIZE,
              transform: `translate(${translateX}px, -50%) scale(${size / HAIRSTYLE_BASE_SIZE})`,
            }}
          >
            <button
              aria-label={isNoStyle ? "헤어스타일 적용 안 함" : `${option.label} 선택`}
              aria-pressed={isSelected}
              // disabled 속성을 쓰면 탭 자체가 막혀 안내를 띄울 수 없어 aria-disabled로 표시만 한다.
              aria-disabled={disabled}
              className={cn(
                "ar-motion-press h-full w-full overflow-hidden rounded-full shadow-[0_0_9px_rgba(0,0,0,0.1)] aria-disabled:opacity-45",
                !isNoStyle && "bg-[rgba(103,103,103,0.5)]"
              )}
              onClick={() => handleSelect(option.name)}
              tabIndex={isFocusable ? 0 : -1}
              type="button"
            >
              {isNoStyle ? (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.5)]">
                  <img alt="" className="h-[28px] w-[28px]" src={noStyleIcon} />
                </span>
              ) : option.thumbUrl ? (
                <img
                  decoding="async"
                  loading="lazy"
                  alt={`${option.label} 헤어스타일 썸네일`}
                  className="h-full w-full rounded-full p-[3px] object-contain"
                  src={option.thumbUrl}
                />
              ) : (
                <span
                  className={cn(
                    "flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/30 px-1 text-center text-[9px] font-semibold leading-tight text-white"
                  )}
                >
                  {option.label}
                </span>
              )}
            </button>
          </div>
        );
      })}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px]"
        style={{ borderColor: lightTheme.label.buttonText }}
      />
    </div>
  );
};

export default ArHairstyleCarousel;

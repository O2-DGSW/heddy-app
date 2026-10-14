import { useRef } from "react";
import type { TouchEvent, WheelEvent } from "react";

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
  onSelect: (hairstyleId: HairstyleOptionId) => void;
}

// 가운데(가장 큰) 칸 크기. 모든 칸을 이 크기로 두고 scale로 줄여 레이아웃 없이 애니메이션한다.
const HAIRSTYLE_BASE_SIZE = getHairstyleSize(0);
const SWIPE_THRESHOLD = 24;
const WHEEL_STEP_INTERVAL = 280;

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  hairstyleOptions,
  loadingMessage,
  disabled,
  onSelect,
}: ArHairstyleCarouselProps) => {
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const lastWheelAtRef = useRef(0);

  const handleMove = (offset: -1 | 1) => {
    if (disabled) return;
    onSelect(getCircularHairstyleOption(activeHairstylePosition + offset, hairstyleOptions).id);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (touchStartX === null || touchEndX === undefined) {
      return;
    }

    const distance = touchEndX - touchStartX;

    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      return;
    }

    didSwipeRef.current = true;
    handleMove(distance > 0 ? -1 : 1);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const now = Date.now();

    if (Math.abs(delta) < 4) {
      return;
    }

    event.preventDefault();

    if (now - lastWheelAtRef.current < WHEEL_STEP_INTERVAL) {
      return;
    }

    lastWheelAtRef.current = now;
    handleMove(delta > 0 ? 1 : -1);
  };

  const handleSelect = (hairstyleId: HairstyleOptionId) => {
    if (disabled) return;
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    onSelect(hairstyleId);
  };

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
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      {HAIRSTYLE_VISIBLE_OFFSETS.map(offset => {
        const position = activeHairstylePosition + offset;
        const option = getCircularHairstyleOption(position, hairstyleOptions);
        const isSelected = offset === 0;
        const isNoStyle = option.id === "none";
        const size = getHairstyleSize(offset);
        const isFocusable = Math.abs(offset) <= 2;
        const translateX = getHairstyleItemLeft(offset) + size / 2 - HAIRSTYLE_BASE_SIZE / 2;

        return (
          <div
            className="absolute left-0 top-1/2 transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
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
              disabled={disabled}
              className={cn(
                "ar-motion-press h-full w-full overflow-hidden rounded-full shadow-[0_0_9px_rgba(0,0,0,0.1)] disabled:opacity-45",
                size === 80 && "bg-[#F4FBF8]/90 p-[4px]",
                isSelected && size !== 80 && "ring-[2px] ring-[#F4FBF8]"
              )}
              onClick={() => handleSelect(option.id)}
              tabIndex={isFocusable ? 0 : -1}
              type="button"
            >
              {isNoStyle ? (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.5)]">
                  <img alt="" className="h-[28px] w-[28px]" src={noStyleIcon} />
                </span>
              ) : option.imageUrl ? (
                <img
                  alt={`${option.label} 참고 이미지`}
                  className="h-full w-full object-cover"
                  src={option.imageUrl}
                />
              ) : (
                <span
                  className={cn(
                    "flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/30 px-1 text-center text-[9px] font-semibold leading-tight text-white",
                    size === 80 && "border-[2.5px] border-black"
                  )}
                >
                  {option.label}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ArHairstyleCarousel;

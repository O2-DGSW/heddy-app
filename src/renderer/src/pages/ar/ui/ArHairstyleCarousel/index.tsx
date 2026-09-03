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
import type { ArHairstyleOption, HairstyleOptionId } from "../../model/types";

interface ArHairstyleCarouselProps {
  activeHairstylePosition: number;
  hairstyleOptions: ArHairstyleOption[];
  loadingMessage: string | null;
  onSelect: (hairstyleId: HairstyleOptionId) => void;
}

const SWIPE_THRESHOLD = 24;
const WHEEL_STEP_INTERVAL = 280;

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  hairstyleOptions,
  loadingMessage,
  onSelect,
}: ArHairstyleCarouselProps) => {
  const touchStartXRef = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const lastWheelAtRef = useRef(0);

  const handleMove = (offset: -1 | 1) => {
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

        return (
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-[left,width,height] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            key={position}
            style={{ height: size, left: getHairstyleItemLeft(offset), width: size }}
          >
            <button
              aria-label={isNoStyle ? "헤어스타일 적용 안 함" : `${option.label} 선택`}
              aria-pressed={isSelected}
              className={cn(
                "ar-motion-press h-full w-full overflow-hidden rounded-full shadow-[0_0_9px_rgba(0,0,0,0.1)]",
                size === 80 && "bg-[#F4FBF8]/90 p-[4px]",
                isSelected && size !== 80 && "ring-[2px] ring-[#F4FBF8]"
              )}
              onClick={() => handleSelect(option.id)}
              tabIndex={isFocusable ? 0 : -1}
              type="button"
            >
              {isNoStyle ? (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.3)] backdrop-blur-[5px]">
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
                    "flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/20 px-1 text-center text-[9px] font-semibold leading-tight text-white backdrop-blur",
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

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import noStyleIcon from "../../assets/no-style.svg";
import {
  getCircularHairstyleOption,
  getHairstyleItemLeft,
  getHairstyleSize,
  HAIRSTYLE_VISIBLE_OFFSETS,
} from "../../model/constants";
import type { ArHairstyleOption } from "@/entities/ar-groom";

interface ArHairstyleCarouselProps {
  activeHairstylePosition: number;
  hairstyleOptions: ArHairstyleOption[];
  loadingMessage: string | null;
  disabled: boolean;
  onSelect: (position: number) => void;
  /** 고를 수 없는 상태에서 누르거나 넘겼을 때. 아무 반응이 없으면 고장 난 것처럼 보여 이유를 알린다 */
  onDisabledSelect: () => void;
}

// 가운데(가장 큰) 칸 크기. 모든 칸을 이 크기로 두고 scale로 줄여 레이아웃 없이 애니메이션한다.
const HAIRSTYLE_BASE_SIZE = getHairstyleSize(0);
const HAIRSTYLE_CENTER = getHairstyleItemLeft(0) + HAIRSTYLE_BASE_SIZE / 2;
const HAIRSTYLE_STEP_DISTANCE =
  getHairstyleItemLeft(1) + getHairstyleSize(1) / 2 - HAIRSTYLE_CENTER;
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

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  hairstyleOptions,
  loadingMessage,
  disabled,
  onSelect,
  onDisabledSelect,
}: ArHairstyleCarouselProps) => {
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
    if (event.button !== 0 || !event.isPrimary) return;
    if (disabled) {
      onDisabledSelect();
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
    if (Math.abs(pointer.startX - event.clientX) >= CLICK_SUPPRESSION_DISTANCE) {
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

  const handlePointerCancel = () => {
    if (!pointerRef.current) return;
    pointerRef.current = null;
    animateTo(Math.round(positionRef.current));
  };

  const handleSelect = (nextPosition: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (disabled) {
      onDisabledSelect();
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
        callbacksRef.current.onDisabledSelect();
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
  }, [disabled, loadingMessage, hairstyleOptions.length, animateTo, paintPosition, stopAnimation]);

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
      ref={carouselRef}
      onPointerCancel={handlePointerCancel}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handlePointerCancel}
    >
      {HAIRSTYLE_VISIBLE_OFFSETS.map(offset => {
        const itemPosition = centerPosition + offset;
        const option = getCircularHairstyleOption(itemPosition, hairstyleOptions);
        const isSelected = offset === 0;
        const isNoStyle = option.name === "";
        const visualOffset = itemPosition - position;
        const { center, size } = getHairstyleVisualLayout(visualOffset);
        const isFocusable = Math.abs(offset) <= 2;
        const translateX = center - HAIRSTYLE_BASE_SIZE / 2;

        return (
          <div
            className="absolute left-0 top-1/2 will-change-transform"
            key={itemPosition}
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
              onClick={() => handleSelect(itemPosition)}
              tabIndex={isFocusable ? 0 : -1}
              type="button"
            >
              {isNoStyle ? (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.5)]">
                  <img alt="" draggable={false} className="h-[28px] w-[28px]" src={noStyleIcon} />
                </span>
              ) : option.thumbUrl ? (
                <img
                  decoding="async"
                  draggable={false}
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

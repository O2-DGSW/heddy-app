import { lightTheme } from "@heddy/design-tokens";

import type { ArHairstyleOption } from "@/entities/ar-groom";
import { cn } from "@/shared";
import noStyleIcon from "../../assets/no-style.svg";
import { getCircularHairstyleOption, HAIRSTYLE_VISIBLE_OFFSETS } from "../../model/constants";
import { HAIRSTYLE_BASE_SIZE, getHairstyleVisualLayout } from "../../model/hairstyleCarouselLayout";
import { useHairstyleCarousel } from "../../model/useHairstyleCarousel";
import ArCompactHairstyleList from "./ArCompactHairstyleList";

interface ArHairstyleCarouselProps {
  activeHairstylePosition: number;
  hairstyleOptions: ArHairstyleOption[];
  loadingMessage: string | null;
  disabled: boolean;
  onSelect: (position: number) => void;
  compact?: boolean;
  /** 고를 수 없는 상태에서 누르거나 넘겼을 때. 아무 반응이 없으면 고장 난 것처럼 보여 이유를 알린다 */
  onDisabledSelect?: () => void;
}

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  hairstyleOptions,
  loadingMessage,
  disabled,
  onSelect,
  compact = false,
  onDisabledSelect,
}: ArHairstyleCarouselProps) => {
  const {
    carouselRef,
    position,
    centerPosition,
    handleSelect,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleLostPointerCapture,
  } = useHairstyleCarousel({
    activeHairstylePosition,
    itemCount: hairstyleOptions.length,
    loadingMessage,
    disabled,
    onSelect,
    onDisabledSelect,
  });

  if (compact) {
    return (
      <ArCompactHairstyleList
        activeHairstylePosition={activeHairstylePosition}
        hairstyleOptions={hairstyleOptions}
        disabled={disabled}
        onSelect={handleSelect}
      />
    );
  }

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
      className="relative h-[80px] w-[404px] shrink-0 touch-none select-none overflow-hidden"
      data-pull-to-refresh="ignore"
      ref={carouselRef}
      onPointerCancel={handlePointerCancel}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onLostPointerCapture={handleLostPointerCapture}
    >
      {HAIRSTYLE_VISIBLE_OFFSETS.map(offset => {
        const itemPosition = centerPosition + offset;
        const option = getCircularHairstyleOption(itemPosition, hairstyleOptions);
        const isSelected = offset === 0;
        const isNoStyle = option.name === "";
        const visualOffset = itemPosition - position;
        const { center, size } = getHairstyleVisualLayout(visualOffset);
        const isVisible = size > 0;
        const isFocusable = isVisible && Math.abs(offset) <= 2;
        const translateX = center - HAIRSTYLE_BASE_SIZE / 2;

        return (
          <div
            aria-hidden={!isVisible}
            className="absolute left-0 top-1/2 will-change-transform"
            inert={!isVisible}
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

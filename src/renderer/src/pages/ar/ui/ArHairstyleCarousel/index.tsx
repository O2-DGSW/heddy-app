import { cn } from "@/shared";

import downPermImage from "../../assets/down-perm.png";
import noStyleIcon from "../../assets/no-style.svg";
import {
  getCircularHairstyleOption,
  getHairstyleItemLeft,
  getHairstyleSize,
  HAIRSTYLE_VISIBLE_OFFSETS,
} from "../../model/constants";
import type { HairstyleOptionId } from "../../model/types";

interface ArHairstyleCarouselProps {
  activeHairstylePosition: number;
  isExpanded: boolean;
  onSelect: (hairstyleId: HairstyleOptionId) => void;
}

const ArHairstyleCarousel = ({
  activeHairstylePosition,
  isExpanded,
  onSelect,
}: ArHairstyleCarouselProps) => (
  <div
    aria-label="헤어스타일 선택"
    className={cn(
      "absolute left-1/2 h-[80px] w-[404px] -translate-x-1/2 overflow-hidden",
      isExpanded ? "bottom-[clamp(178px,22%,194px)]" : "bottom-[clamp(12px,4%,24px)]"
    )}
  >
    {HAIRSTYLE_VISIBLE_OFFSETS.map(offset => {
      const position = activeHairstylePosition + offset;
      const option = getCircularHairstyleOption(position);
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
            aria-label={isNoStyle ? "헤어스타일 적용 안 함" : "다운펌 선택"}
            aria-pressed={isSelected}
            className={cn(
              "ar-motion-press h-full w-full overflow-hidden rounded-full shadow-[0_0_9px_rgba(0,0,0,0.1)]",
              size === 80 && "bg-[#F4FBF8]/90 p-[4px]",
              isSelected && size !== 80 && "ring-[2px] ring-[#F4FBF8]"
            )}
            onClick={() => onSelect(option.id)}
            tabIndex={isFocusable ? 0 : -1}
            type="button"
          >
            {isNoStyle ? (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(103,103,103,0.3)] backdrop-blur-[5px]">
                <img alt="" className="h-[28px] w-[28px]" src={noStyleIcon} />
              </span>
            ) : (
              <span
                className={cn(
                  "block h-full w-full overflow-hidden rounded-full",
                  size === 80 && "border-[2.5px] border-black"
                )}
              >
                <img
                  alt="다운펌 헤어스타일"
                  className="h-full w-full object-cover"
                  src={downPermImage}
                />
              </span>
            )}
          </button>
        </div>
      );
    })}
  </div>
);

export default ArHairstyleCarousel;

import { font, lightTheme } from "@heddy/design-tokens";

import type { ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { cn } from "@/shared";

interface ArHairstyleCardProps {
  option: ArHairstyleOption;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (name: HairstyleOptionId) => void;
}

const ArHairstyleCard = ({ option, isSelected, disabled, onSelect }: ArHairstyleCardProps) => (
  <button
    aria-disabled={disabled}
    aria-pressed={isSelected}
    className={cn("ar-motion-press min-w-0 rounded-[14px] border p-2 text-left")}
    onClick={() => onSelect(option.name)}
    style={{
      backgroundColor: lightTheme.background.normal,
      borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.normal,
      color: lightTheme.label.neutral,
    }}
    type="button"
  >
    {option.thumbUrl ? (
      <img
        alt={`${option.label} 헤어스타일 썸네일`}
        className="aspect-square w-full rounded-[10px] object-contain p-2"
        decoding="async"
        loading="lazy"
        src={option.thumbUrl}
        style={{ backgroundColor: lightTheme.background.neutral }}
      />
    ) : (
      <span
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-[10px] px-2 text-center",
          font.label.semiBold
        )}
        style={{
          backgroundColor: lightTheme.background.neutral,
          color: lightTheme.label.alternative,
        }}
      >
        {option.label}
      </span>
    )}
    <span className={cn("mt-2 block truncate", font.label.semiBold)}>{option.label}</span>
    {(option.gender || option.type) && (
      <span
        className={cn("mt-1 block truncate", font.caption.regular)}
        style={{ color: lightTheme.label.alternative }}
      >
        {[option.gender, option.type].filter(Boolean).join(" · ")}
      </span>
    )}
    {option.tags && option.tags.length > 0 && (
      <span
        className={cn("mt-1 block truncate", font.caption.regular)}
        style={{ color: lightTheme.label.alternative }}
      >
        {option.tags.join(" · ")}
      </span>
    )}
  </button>
);

export default ArHairstyleCard;

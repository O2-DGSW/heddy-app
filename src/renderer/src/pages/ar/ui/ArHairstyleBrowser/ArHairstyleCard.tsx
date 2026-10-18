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
    className="ar-motion-press flex w-full min-w-0 items-center gap-3 rounded-2xl px-2 py-3 text-left"
    onClick={() => onSelect(option.name)}
    style={{
      backgroundColor: isSelected ? lightTheme.background.alternative : "transparent",
      color: lightTheme.label.normal,
    }}
    type="button"
  >
    <span
      className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      {option.thumbUrl ? (
        <img
          alt={`${option.label} 헤어스타일 썸네일`}
          className="size-full object-contain p-1"
          decoding="async"
          loading="lazy"
          src={option.thumbUrl}
        />
      ) : (
        <span aria-hidden="true" className={font.headline2.semiBold}>
          —
        </span>
      )}
    </span>
    <span className="min-w-0 flex-1">
      <span className={cn("block truncate", font.label.semiBold)}>{option.label}</span>
      {option.gender || option.type || option.tags?.length ? (
        <span
          className={cn("mt-1 block truncate", font.caption.regular)}
          style={{ color: lightTheme.label.assistive }}
        >
          {[option.gender, option.type, ...(option.tags ?? [])].filter(Boolean).join(" · ")}
        </span>
      ) : null}
    </span>
    {isSelected && (
      <span className={font.caption.semiBold} style={{ color: lightTheme.primary.normal }}>
        적용 중
      </span>
    )}
  </button>
);

export default ArHairstyleCard;

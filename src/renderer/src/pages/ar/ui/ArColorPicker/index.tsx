import { font, lightTheme } from "@heddy/design-tokens";

import { HAIR_COLOR_OPTIONS } from "../../model/constants";
import { cn } from "@/shared";

interface ArColorPickerProps {
  isExpanded: boolean;
  disabled: boolean;
  selectedColor: string;
  onSelect: (color: string) => void;
}

const ArColorPicker = ({ isExpanded, disabled, selectedColor, onSelect }: ArColorPickerProps) => {
  const handleSelect = (color: string) => onSelect(color);

  return (
    <div
      aria-label="헤어 컬러 선택"
      className={cn(
        "absolute left-[clamp(16px,7vw,31px)] flex max-h-[calc(100%-240px)] flex-col gap-2 overflow-y-auto",
        isExpanded ? "top-[clamp(64px,20%,185px)]" : "top-[clamp(40px,18%,172px)]"
      )}
    >
      {HAIR_COLOR_OPTIONS.map(option => (
        <button
          aria-label={option.label}
          aria-pressed={option.color === selectedColor}
          className={cn(
            "ar-motion-press h-9 w-9 shrink-0 rounded-full border-2 disabled:cursor-not-allowed disabled:opacity-45",
            option.color === selectedColor ? "border-current" : "border-transparent",
            font.caption.medium
          )}
          disabled={disabled}
          key={option.id}
          onClick={() => handleSelect(option.color)}
          style={{
            backgroundColor: option.color || lightTheme.background.normal,
            color: lightTheme.primary.normal,
          }}
          type="button"
        >
          {option.color === "" && "자동"}
        </button>
      ))}
    </div>
  );
};

export default ArColorPicker;

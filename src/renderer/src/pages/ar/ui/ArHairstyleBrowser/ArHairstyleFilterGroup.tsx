import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

interface ArHairstyleFilterGroupProps {
  label: string;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
}

const ArHairstyleFilterGroup = ({
  label,
  options,
  selectedValue,
  onSelect,
}: ArHairstyleFilterGroupProps) => (
  <fieldset className="min-w-0">
    <legend
      className={cn("mb-2", font.caption.semiBold)}
      style={{ color: lightTheme.label.alternative }}
    >
      {label}
    </legend>
    <div aria-label={`${label} 필터`} className="flex gap-2 overflow-x-auto pb-1" role="group">
      {[null, ...options].map(value => {
        const isSelected = selectedValue === value;

        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              "ar-motion-press shrink-0 rounded-full border px-3 py-1.5",
              font.caption.medium
            )}
            key={value ?? "all"}
            onClick={() => onSelect(value)}
            style={{
              backgroundColor: isSelected
                ? lightTheme.primary.normal
                : lightTheme.background.alternative,
              borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.normal,
              color: isSelected ? lightTheme.label.buttonText : lightTheme.label.alternative,
            }}
            type="button"
          >
            {value ?? "전체"}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default ArHairstyleFilterGroup;

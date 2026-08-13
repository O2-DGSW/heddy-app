import { font, lightTheme } from "@heddy/design-tokens";

import { CUTS_CATEGORIES, type CutsCategoryFilterValue } from "@/features/cuts/constrants/categories";

interface CutsCategoryFilterProps {
  selected: CutsCategoryFilterValue;
  onSelect: (category: CutsCategoryFilterValue) => void;
}

export const CutsCategoryFilter = ({ selected, onSelect }: CutsCategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hidden">
      {CUTS_CATEGORIES.map(category => {
        const isActive = category === selected;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`shrink-0 rounded-full px-3 py-1.5 transition-colors duration-200 ${font.label.medium}`}
            style={{
              backgroundColor: isActive ? lightTheme.primary.normal : lightTheme.fill.normal,
              color: isActive ? lightTheme.background.normal : lightTheme.label.alternative,
            }}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};

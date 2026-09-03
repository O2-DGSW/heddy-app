import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import { MAX_VISIBLE_RESULT_TAGS } from "../../model/constants";
import type { StyleTag, StyleTagStatusType } from "../../model/types";
import StyleTagButton from "../StyleTagButton";

interface StyleTagResultRowProps {
  label: string;
  tags: StyleTag[];
  status: Exclude<StyleTagStatusType, "none">;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const StyleTagResultRow = ({
  label,
  tags,
  status,
  isExpanded,
  onToggleExpand,
}: StyleTagResultRowProps) => {
  const visibleTags = tags.slice(0, MAX_VISIBLE_RESULT_TAGS);
  const hasHiddenTags = tags.length > MAX_VISIBLE_RESULT_TAGS;
  const displayTags = isExpanded ? tags : visibleTags;

  return (
    <div className="flex flex-col gap-[14px] px-[14px] py-[14px]">
      <div className="flex min-h-[26px] items-center justify-between gap-[12px]">
        <span className={font.body.medium} style={{ color: lightTheme.label.inactive }}>
          {label}
        </span>

        <div className="flex flex-wrap items-center justify-end gap-[4px]">
          {!isExpanded &&
            displayTags.map(tag => (
              <StyleTagButton key={tag.id} label={tag.label} status={status} />
            ))}

          {hasHiddenTags && (
            <button
              aria-expanded={isExpanded}
              aria-label={isExpanded ? `${label} 접기` : `${label} 더 보기`}
              className="flex h-[32px] w-[32px] shrink-0 items-center justify-center border-0 bg-transparent p-0"
              onClick={onToggleExpand}
              type="button"
            >
              <svg
                aria-hidden="true"
                className={cn(
                  "h-[24px] w-[24px] transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
              >
                <path d="M12 15L17 10H7L12 15Z" fill={lightTheme.label.assistive} />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-[4px] transition-opacity duration-200">
          {displayTags.map(tag => (
            <StyleTagButton key={tag.id} label={tag.label} status={status} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleTagResultRow;

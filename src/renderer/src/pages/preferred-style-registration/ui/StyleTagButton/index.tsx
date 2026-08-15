import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import { SELECTED_BACKGROUND_COLOR } from "../../model/constants";
import type { StyleTagStatusType } from "../../model/types";

interface StyleTagButtonProps {
  label: string;
  status: StyleTagStatusType;
  disabled?: boolean;
  onClick?: () => void;
}

const StyleTagButton = ({ label, status, disabled = false, onClick }: StyleTagButtonProps) => {
  const isPreferred = status === "preferred";
  const isExcluded = status === "excluded";
  const className = cn(
    `inline-flex h-[26px] shrink-0 items-center justify-center rounded-[15px] border px-[8px] py-[4px] transition-colors duration-200 ${font.label.medium}`,
    disabled && "cursor-not-allowed"
  );
  const style = {
    backgroundColor: isPreferred
      ? SELECTED_BACKGROUND_COLOR
      : isExcluded
        ? lightTheme.line.normal
        : lightTheme.background.normal,
    borderColor: isPreferred
      ? lightTheme.primary.normal
      : isExcluded
        ? lightTheme.line.normal
        : lightTheme.fill.neutral,
    color: isPreferred
      ? lightTheme.primary.normal
      : isExcluded
        ? lightTheme.label.assistive
        : lightTheme.label.alternative,
  };

  if (!onClick) {
    return (
      <span className={className} style={style}>
        {label}
      </span>
    );
  }

  return (
    <button
      aria-pressed={isPreferred || isExcluded}
      className={className}
      disabled={disabled}
      onClick={onClick}
      style={style}
      type="button"
    >
      {label}
    </button>
  );
};

export default StyleTagButton;

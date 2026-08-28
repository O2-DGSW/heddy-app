import { font } from "@heddy/design-tokens";

import { cn } from "@/shared";
import type { IconType } from "../../model/types";

interface BarItemProps {
  Icon: IconType;
  isActive: boolean;
  title: string;
  iconClassName?: string;
  iconColor: string;
  backgroundColor: string;
  textColor: string;
  onClick: () => void;
}

const BarItem = ({
  Icon,
  isActive,
  title,
  iconClassName,
  iconColor,
  backgroundColor,
  textColor,
  onClick,
}: BarItemProps) => {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      aria-label={title}
      className="flex min-h-[55px] shrink-0 justify-center border-0 bg-transparent p-0"
      onClick={onClick}
      type="button"
    >
      <span className="flex flex-col items-center gap-[4px]">
        <span
          className="flex h-[34px] w-[35px] items-center justify-center rounded-[8px]"
          style={{ backgroundColor }}
        >
          <Icon
            aria-hidden="true"
            className={cn("h-[35px] w-[35px]", iconClassName)}
            style={{ color: iconColor }}
          />
        </span>

        <span className={font.label.medium} style={{ color: textColor }}>
          {title}
        </span>
      </span>
    </button>
  );
};

export default BarItem;

import { font, lightTheme } from "@heddy/design-tokens";

import { EXPANDED_BOTTOM_ITEMS } from "../../model/constants";
import { cn } from "@/shared";

const ArExpandedBottomMenu = () => (
  <>
    <div
      aria-label="확대 AR 하단 메뉴"
      className={cn(
        "absolute bottom-[clamp(96px,15%,140px)] left-1/2 flex -translate-x-1/2 items-center gap-[33px]",
        font.label.medium
      )}
      style={{ color: lightTheme.label.assistive }}
    >
      {EXPANDED_BOTTOM_ITEMS.map((item, index) => (
        <span
          className={cn("text-center", index < 3 && "w-[35px]", index === 3 && "whitespace-nowrap")}
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  </>
);

export default ArExpandedBottomMenu;

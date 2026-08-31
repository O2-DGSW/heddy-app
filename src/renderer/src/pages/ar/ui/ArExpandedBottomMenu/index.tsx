import { font, lightTheme } from "@heddy/design-tokens";

import { EXPANDED_BOTTOM_ITEMS } from "../../model/constants";
import { cn } from "@/shared";

const ArExpandedBottomMenu = () => (
  <>
    <div
      aria-label="확대 AR 하단 메뉴"
      className={cn(
        "absolute left-1/2 top-[746px] flex -translate-x-1/2 items-center gap-[33px]",
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
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 flex h-[34px] items-end justify-center bg-white pb-[8px]"
    >
      <span className="h-[5px] w-[144px] rounded-full bg-black" />
    </div>
  </>
);

export default ArExpandedBottomMenu;

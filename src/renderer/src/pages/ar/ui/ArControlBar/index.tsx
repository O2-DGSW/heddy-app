import { font, lightTheme } from "@heddy/design-tokens";

import bookmarkIcon from "../../assets/bookmark.svg";
import minimizeIcon from "../../assets/minimize.svg";
import refreshIcon from "../../assets/refresh.svg";
import resizeIcon from "../../assets/resize.svg";
import { cn } from "@/shared";

interface ArControlBarProps {
  handleExpandedToggle: () => void;
  handleModalOpen: () => void;
  handleStyleReset: () => void;
  isExpanded: boolean;
}

const ArControlBar = ({
  handleExpandedToggle,
  handleModalOpen,
  handleStyleReset,
  isExpanded,
}: ArControlBarProps) => (
  <div
    className={cn(
      "absolute left-1/2 flex w-[332px] -translate-x-1/2 items-center gap-[8px]",
      isExpanded ? "bottom-[clamp(270px,35%,314px)]" : "bottom-[clamp(112px,26%,142px)]"
    )}
  >
    <button
      aria-label="후보 스타일 저장"
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
      onClick={handleModalOpen}
      type="button"
    >
      <img alt="" className="h-[19px] w-[15px]" src={bookmarkIcon} />
    </button>
    <span
      className={cn(
        "flex h-[37px] flex-1 items-center justify-center whitespace-nowrap rounded-full bg-white/20 px-[43px] py-[9px] text-center shadow-[0_0_11.556px_rgba(0,0,0,0.07)] backdrop-blur",
        font.label.medium
      )}
      style={{ color: lightTheme.label.disable }}
    >
      다운펌 - 내추럴 블랙
    </span>
    <button
      aria-label="스타일 선택 초기화"
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
      onClick={handleStyleReset}
      type="button"
    >
      <img alt="" className="h-[20px] w-[20px]" src={refreshIcon} />
    </button>
    <button
      aria-label={isExpanded ? "AR 화면 축소" : "AR 화면 확대"}
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
      onClick={handleExpandedToggle}
      type="button"
    >
      <img alt="" className="h-[20.5px] w-[20.5px]" src={isExpanded ? minimizeIcon : resizeIcon} />
    </button>
  </div>
);

export default ArControlBar;

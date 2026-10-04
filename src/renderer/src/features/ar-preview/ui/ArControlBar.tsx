import { font, lightTheme } from "@heddy/design-tokens";

import bookmarkIcon from "../assets/bookmark.svg";
import minimizeIcon from "../assets/minimize.svg";
import refreshIcon from "../assets/refresh.svg";
import resizeIcon from "../assets/resize.svg";
import { cn } from "@/shared";

interface ArControlBarProps {
  handleExpandedToggle: () => void;
  handleModalOpen?: () => void;
  handleStyleReset: () => void;
  isExpanded: boolean;
  selectedHairstyleLabel: string;
  compact?: boolean;
  resetLabel?: string;
}

const ArControlBar = ({
  handleExpandedToggle,
  handleModalOpen,
  handleStyleReset,
  isExpanded,
  selectedHairstyleLabel,
  compact = false,
  resetLabel = "스타일 선택 초기화",
}: ArControlBarProps) => (
  <div
    className={cn(
      "flex w-[calc(100%-24px)] max-w-[332px] items-center",
      compact && "gap-1",
      !compact && "gap-2"
    )}
  >
    {handleModalOpen && (
      <button
        aria-label="후보 스타일 저장"
        className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]"
        onClick={handleModalOpen}
        type="button"
      >
        <img alt="" className="h-[19px] w-[15px]" src={bookmarkIcon} />
      </button>
    )}
    <span
      className={cn(
        "block min-w-0 flex-1 truncate rounded-full bg-white/20 text-center shadow-[0_0_11.556px_rgba(0,0,0,0.07)] backdrop-blur",
        !compact && "h-[37px] px-[clamp(24px,10vw,43px)] py-[9px]",
        !compact && font.label.medium,
        compact && "h-8 px-1 py-1",
        compact && font.caption.medium
      )}
      style={{ color: lightTheme.label.disable }}
    >
      {selectedHairstyleLabel}
    </span>
    <button
      aria-label={resetLabel}
      className={cn(
        "ar-motion-press flex shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]",
        compact && "size-8",
        !compact && "size-[37px]"
      )}
      onClick={handleStyleReset}
      type="button"
    >
      <img alt="" className="h-[20px] w-[20px]" src={refreshIcon} />
    </button>
    <button
      aria-label={isExpanded ? "AR 화면 축소" : "AR 화면 확대"}
      className={cn(
        "ar-motion-press flex shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] backdrop-blur-[1.779px]",
        compact && "size-8",
        !compact && "size-[37px]"
      )}
      onClick={handleExpandedToggle}
      type="button"
    >
      <img alt="" className="h-[20.5px] w-[20.5px]" src={isExpanded ? minimizeIcon : resizeIcon} />
    </button>
  </div>
);

export default ArControlBar;

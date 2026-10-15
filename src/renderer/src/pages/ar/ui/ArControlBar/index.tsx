import { font, lightTheme } from "@heddy/design-tokens";

import bookmarkIcon from "../../assets/bookmark.svg";
import refreshIcon from "../../assets/refresh.svg";
import { cn } from "@/shared";

interface ArControlBarProps {
  handleHairstyleBrowserOpen: () => void;
  handleModalOpen: () => void;
  handleStyleReset: () => void;
  isHairstyleBrowserOpen: boolean;
  selectedHairstyleLabel: string;
}

const ArControlBar = ({
  handleHairstyleBrowserOpen,
  handleModalOpen,
  handleStyleReset,
  isHairstyleBrowserOpen,
  selectedHairstyleLabel,
}: ArControlBarProps) => (
  <div className="flex w-[calc(100%-24px)] max-w-[332px] items-center gap-[8px]">
    <button
      aria-label="후보 스타일 저장"
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)]"
      onClick={handleModalOpen}
      type="button"
    >
      <img alt="" className="h-[19px] w-[15px]" src={bookmarkIcon} />
    </button>
    <button
      aria-expanded={isHairstyleBrowserOpen}
      aria-haspopup="dialog"
      aria-label="헤어스타일 목록 열기"
      className={cn(
        "ar-motion-press flex h-[37px] min-w-0 flex-1 items-center justify-center gap-1 truncate rounded-full bg-white/30 px-[clamp(24px,10vw,43px)] py-[9px] text-center shadow-[0_0_11.556px_rgba(0,0,0,0.07)]",
        font.label.medium
      )}
      onClick={handleHairstyleBrowserOpen}
      style={{ color: lightTheme.label.disable }}
      type="button"
    >
      <span className="truncate">{selectedHairstyleLabel}</span>
      <span aria-hidden="true" className="shrink-0">
        ⌄
      </span>
    </button>
    <button
      aria-label="스타일 선택 초기화"
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)]"
      onClick={handleStyleReset}
      type="button"
    >
      <img alt="" className="h-[20px] w-[20px]" src={refreshIcon} />
    </button>
  </div>
);

export default ArControlBar;

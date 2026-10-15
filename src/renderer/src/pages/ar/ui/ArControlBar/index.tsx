import { font, lightTheme } from "@heddy/design-tokens";

import bookmarkIcon from "../../assets/bookmark.svg";
import refreshIcon from "../../assets/refresh.svg";
import { cn } from "@/shared";

interface ArControlBarProps {
  handleHairstyleBrowserOpen: () => void;
  handleCandidateSave: () => void;
  handleCameraSwitch: () => void;
  isCandidateSaved: boolean;
  isHairstyleBrowserOpen: boolean;
  isSavePending: boolean;
  selectedHairstyleLabel: string;
}

const ArControlBar = ({
  handleHairstyleBrowserOpen,
  handleCandidateSave,
  handleCameraSwitch,
  isCandidateSaved,
  isHairstyleBrowserOpen,
  isSavePending,
  selectedHairstyleLabel,
}: ArControlBarProps) => (
  <div className="flex w-[calc(100%-24px)] max-w-[332px] items-center gap-[8px]">
    <button
      aria-label={isCandidateSaved ? "후보 스타일 저장 취소" : "후보 스타일 저장"}
      aria-busy={isSavePending}
      aria-pressed={isCandidateSaved}
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)] disabled:opacity-50"
      disabled={isSavePending}
      onClick={handleCandidateSave}
      style={isCandidateSaved ? { backgroundColor: lightTheme.primary.normal } : undefined}
      type="button"
    >
      <img
        alt=""
        className={cn("h-[19px] w-[15px]", isCandidateSaved && "brightness-0 invert")}
        src={bookmarkIcon}
      />
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
      aria-label="전면·후면 카메라 전환"
      className="ar-motion-press flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full bg-white/20 shadow-[0_0_8.222px_rgba(0,0,0,0.07)]"
      onClick={handleCameraSwitch}
      type="button"
    >
      <img alt="" className="h-[20px] w-[20px]" src={refreshIcon} />
    </button>
  </div>
);

export default ArControlBar;

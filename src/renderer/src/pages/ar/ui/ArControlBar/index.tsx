import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import refreshIcon from "../../assets/refresh.svg";
import ArColorPicker from "../ArColorPicker";
import ArCustomColorPicker from "../ArCustomColorPicker";
import { cn } from "@/shared";

interface ArControlBarProps {
  handleHairstyleBrowserOpen: () => void;
  handleCameraSwitch: () => void;
  isHairstyleBrowserOpen: boolean;
  selectedHairstyleLabel: string;
  selectedColor: string;
  canSelectColor: boolean;
  onColorSelect: (color: string) => void;
}

const ArControlBar = ({
  handleHairstyleBrowserOpen,
  handleCameraSwitch,
  isHairstyleBrowserOpen,
  selectedHairstyleLabel,
  selectedColor,
  canSelectColor,
  onColorSelect,
}: ArControlBarProps) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isCustomColorOpen, setIsCustomColorOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const paletteId = useId();

  const handlePaletteClick = () => {
    if (!isPaletteOpen) {
      setIsPaletteOpen(true);
      return;
    }
    if (canSelectColor) setIsCustomColorOpen(open => !open);
  };
  const handleCustomColorClose = () => {
    setIsCustomColorOpen(false);
    toggleRef.current?.focus();
  };
  const handlePresetSelect = (color: string) => {
    setIsCustomColorOpen(false);
    onColorSelect(color);
  };
  const handlePaletteKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    if (isCustomColorOpen) {
      event.stopPropagation();
      handleCustomColorClose();
      return;
    }
    setIsPaletteOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    if (!isPaletteOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !paletteRef.current?.contains(event.target)) {
        setIsPaletteOpen(false);
        setIsCustomColorOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isPaletteOpen]);

  return (
    <div className="flex w-[calc(100%-24px)] max-w-[332px] items-center gap-2">
      <div
        ref={paletteRef}
        onKeyDown={handlePaletteKeyDown}
        className="relative h-[37px] min-w-0 flex-1"
      >
        {isPaletteOpen && isCustomColorOpen && canSelectColor && (
          <ArCustomColorPicker
            selectedColor={selectedColor}
            onSelect={onColorSelect}
            onClose={handleCustomColorClose}
          />
        )}
        <button
          aria-expanded={isHairstyleBrowserOpen}
          aria-haspopup="dialog"
          aria-label="헤어스타일 목록 열기"
          aria-hidden={isPaletteOpen}
          inert={isPaletteOpen}
          className={cn(
            "ar-motion-press absolute inset-y-0 left-[45px] right-0 flex min-w-0 items-center justify-center truncate rounded-full bg-white/30 px-4 transition-opacity duration-200 motion-reduce:transition-none",
            isPaletteOpen && "pointer-events-none opacity-0",
            font.label.medium
          )}
          onClick={handleHairstyleBrowserOpen}
          style={{ color: lightTheme.label.disable }}
          type="button"
        >
          <span className="truncate">{selectedHairstyleLabel}</span>
        </button>
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-10 flex items-center overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-out motion-reduce:transition-none",
            isPaletteOpen ? "w-full bg-white/30 backdrop-blur-md" : "w-[37px] bg-white/20"
          )}
        >
          <button
            ref={toggleRef}
            aria-label={isPaletteOpen ? "직접 헤어 색상 선택" : "헤어 색상 팔레트 열기"}
            aria-expanded={isPaletteOpen}
            aria-controls={paletteId}
            aria-disabled={isPaletteOpen && !canSelectColor}
            className="ar-motion-press relative flex size-[37px] shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
            onClick={handlePaletteClick}
            type="button"
          >
            <span
              aria-hidden="true"
              className="size-[29px] rounded-full bg-[radial-gradient(circle,white_0%,transparent_70%),conic-gradient(red,yellow,lime,aqua,blue,magenta,red)] ring-1 ring-white/50"
            />
          </button>
          <div
            id={paletteId}
            aria-hidden={!isPaletteOpen}
            inert={!isPaletteOpen}
            className={cn(
              "min-w-0 flex-1 transition-opacity duration-200 motion-reduce:transition-none",
              !isPaletteOpen && "opacity-0"
            )}
          >
            <ArColorPicker
              disabled={!canSelectColor}
              selectedColor={selectedColor}
              onSelect={handlePresetSelect}
            />
          </div>
        </div>
      </div>
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
};

export default ArControlBar;

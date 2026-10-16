import { useEffect, useRef } from "react";

import { HAIR_COLOR_OPTIONS } from "../../model/constants";
import { cn } from "@/shared";

interface ArColorPickerProps {
  disabled: boolean;
  selectedColor: string;
  onSelect: (color: string) => void;
}

const ArColorPicker = ({ disabled, selectedColor, onSelect }: ArColorPickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleSelect = (color: string) => onSelect(color);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const multiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      element.scrollLeft += event.deltaY * multiplier;
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="헤어 컬러 선택"
      className="flex touch-pan-x items-center gap-2 overflow-x-auto overscroll-x-contain py-1 pl-1 pr-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {HAIR_COLOR_OPTIONS.map(option => (
        <button
          aria-label={option.label}
          title={option.label}
          aria-pressed={option.color === selectedColor}
          className={cn(
            "ar-motion-press h-[29px] w-[29px] shrink-0 rounded-full border-2 disabled:cursor-not-allowed disabled:opacity-45",
            option.color === selectedColor ? "border-white ring-1 ring-white/60" : "border-white/20"
          )}
          disabled={disabled}
          key={option.id}
          onClick={() => handleSelect(option.color)}
          style={{
            backgroundColor: option.color,
          }}
          type="button"
        />
      ))}
    </div>
  );
};

export default ArColorPicker;

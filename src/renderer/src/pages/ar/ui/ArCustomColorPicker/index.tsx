import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useId, useRef, useState } from "react";

import { hairColorHslToHex, hexToHairColorHsl } from "../../model/hairColor";
import type { HairColorHsl } from "../../model/hairColor";
import { cn } from "@/shared";

interface ArCustomColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

const ArCustomColorPicker = ({ selectedColor, onSelect, onClose }: ArCustomColorPickerProps) => {
  const [color, setColor] = useState(() => hexToHairColorHsl(selectedColor));
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const hex = hairColorHslToHex(color);
  const sliders = [
    {
      key: "hue",
      label: "색조",
      max: 360,
      gradient: "linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)",
      valueText: `${Math.round(color.hue)}도`,
    },
    {
      key: "saturation",
      label: "선명함",
      max: 100,
      gradient: `linear-gradient(to right, hsl(${color.hue} 0% 50%), hsl(${color.hue} 100% 50%))`,
      valueText: `${Math.round(color.saturation)}%`,
    },
    {
      key: "lightness",
      label: "밝기",
      max: 100,
      gradient: `linear-gradient(to right, black, hsl(${color.hue} ${color.saturation}% 50%), white)`,
      valueText: `${Math.round(color.lightness)}%`,
    },
  ] as const;

  const handleColorChange = (key: keyof HairColorHsl, value: number) => {
    const nextColor = { ...color, [key]: value };
    setColor(nextColor);
    onSelect(hairColorHslToHex(nextColor));
  };

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="absolute -right-[45px] bottom-[calc(100%+12px)] left-0 z-20 max-h-[min(380px,55dvh)] overflow-y-auto overscroll-contain rounded-3xl p-4 shadow-xl outline-none"
      style={{ backgroundColor: lightTheme.background.normal, color: lightTheme.label.normal }}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="size-11 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: hex }}
        />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className={font.label.semiBold}>
            직접 색상 선택
          </h2>
          <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
            머리색에 바로 적용돼요
          </p>
        </div>
        <button
          type="button"
          className={cn("min-h-11 min-w-11 rounded-full px-3", font.label.semiBold)}
          style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
          onClick={onClose}
        >
          완료
        </button>
      </div>
      {sliders.map(slider => (
        <label key={slider.key} className="block">
          <span className={cn("flex items-center justify-between", font.caption.medium)}>
            <span>{slider.label}</span>
            <span style={{ color: lightTheme.label.assistive }}>{slider.valueText}</span>
          </span>
          <span className="relative flex h-11 items-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 h-3 rounded-full ring-1 ring-black/5"
              style={{ background: slider.gradient }}
            />
            <input
              type="range"
              min={0}
              max={slider.max}
              step={1}
              value={color[slider.key]}
              aria-label={slider.label}
              aria-valuetext={slider.valueText}
              onChange={event => handleColorChange(slider.key, Number(event.currentTarget.value))}
              className="relative h-11 w-full cursor-pointer touch-pan-y appearance-none rounded-full bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </span>
        </label>
      ))}
    </div>
  );
};

export default ArCustomColorPicker;

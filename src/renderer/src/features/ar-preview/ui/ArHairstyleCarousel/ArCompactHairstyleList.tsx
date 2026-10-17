import type { ArHairstyleOption } from "@/entities/ar-groom";
import noStyleIcon from "../../assets/no-style.svg";
import { getCircularHairstyleOption } from "../../model/constants";

interface ArCompactHairstyleListProps {
  activeHairstylePosition: number;
  hairstyleOptions: ArHairstyleOption[];
  disabled: boolean;
  onSelect: (position: number) => void;
}

const ArCompactHairstyleList = ({
  activeHairstylePosition,
  hairstyleOptions,
  disabled,
  onSelect,
}: ArCompactHairstyleListProps) => {
  return (
    <div
      aria-label="헤어스타일 선택"
      className="flex w-full items-center justify-center gap-2 overflow-x-auto px-3"
    >
      {hairstyleOptions.map((option, index) => (
        <button
          key={option.name}
          type="button"
          aria-label={option.name === "" ? "헤어스타일 적용 안 함" : `${option.label} 선택`}
          aria-pressed={
            getCircularHairstyleOption(activeHairstylePosition, hairstyleOptions).name ===
            option.name
          }
          disabled={disabled}
          onClick={() => onSelect(index)}
          className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-white/80 bg-white/20 p-1 disabled:opacity-45"
        >
          {option.name === "" ? (
            <img src={noStyleIcon} alt="" className="size-full p-1" />
          ) : option.thumbUrl ? (
            <img
              src={option.thumbUrl}
              alt={option.label}
              className="size-full rounded-full object-contain"
            />
          ) : (
            option.label
          )}
        </button>
      ))}
    </div>
  );
};

export default ArCompactHairstyleList;

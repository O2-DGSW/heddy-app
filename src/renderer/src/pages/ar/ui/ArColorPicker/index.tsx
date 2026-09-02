import { HAIR_COLOR_OPTIONS } from "../../model/constants";
import { cn } from "@/shared";

interface ArColorPickerProps {
  isExpanded: boolean;
  selectedColorId: string;
  setSelectedColorId: (colorId: string) => void;
}

const ArColorPicker = ({ isExpanded, selectedColorId, setSelectedColorId }: ArColorPickerProps) => (
  <div
    aria-label="헤어 컬러 선택"
    className={cn(
      "absolute left-[31px] flex flex-col gap-[11px]",
      isExpanded ? "top-[clamp(76px,20%,185px)]" : "top-[clamp(96px,30%,172px)]"
    )}
  >
    {HAIR_COLOR_OPTIONS.map(option => {
      const isSelected = option.id === selectedColorId;

      return (
        <button
          aria-label={`${option.id} 컬러 선택`}
          aria-pressed={isSelected}
          className="ar-motion-press h-[36px] w-[36px] rounded-full"
          key={option.id}
          onClick={() => setSelectedColorId(option.id)}
          style={{
            backgroundColor: option.color,
            borderColor: isSelected ? "#F4FBF8" : "rgba(128, 128, 128, 0.3)",
            borderWidth: isSelected ? "2px" : "0.818841px",
          }}
          type="button"
        />
      );
    })}
  </div>
);

export default ArColorPicker;

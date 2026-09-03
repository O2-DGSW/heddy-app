import { HAIR_COLOR_OPTIONS } from "../../model/constants";
import { cn } from "@/shared";

// 선택값은 아직 AR 서버 요청에 반영되지 않는다. 서버 지원 전까지 적용된 것처럼 보이지 않게 한다.
const IS_COLOR_SELECTION_ENABLED = false;

interface ArColorPickerProps {
  isExpanded: boolean;
  selectedColorId: string;
  setSelectedColorId: (colorId: string) => void;
}

const ArColorPicker = ({ isExpanded, selectedColorId, setSelectedColorId }: ArColorPickerProps) => (
  <div
    aria-label="헤어 컬러 선택, 현재 사용할 수 없음"
    className={cn(
      "absolute left-[clamp(16px,7vw,31px)] flex flex-col gap-[11px] [@media(max-height:700px)]:gap-[8px]",
      isExpanded ? "top-[clamp(64px,20%,185px)]" : "top-[clamp(40px,18%,172px)]"
    )}
  >
    {HAIR_COLOR_OPTIONS.map(option => {
      const isSelected = option.id === selectedColorId;

      return (
        <button
          aria-label={`${option.id} 컬러 선택`}
          aria-pressed={isSelected}
          className="ar-motion-press h-[36px] w-[36px] rounded-full disabled:cursor-not-allowed disabled:opacity-45 [@media(max-height:700px)]:h-[30px] [@media(max-height:700px)]:w-[30px]"
          disabled={!IS_COLOR_SELECTION_ENABLED}
          key={option.id}
          onClick={() => {
            if (IS_COLOR_SELECTION_ENABLED) {
              setSelectedColorId(option.id);
            }
          }}
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

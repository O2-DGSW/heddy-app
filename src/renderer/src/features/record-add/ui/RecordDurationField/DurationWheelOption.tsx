import { font, lightTheme } from "@heddy/design-tokens";
import { memo } from "react";

import { cn } from "@/shared";

import { WHEEL_ITEM_HEIGHT } from "./constants";

interface DurationWheelOptionProps {
  option: number;
  loopedIndex: number;
  unit: string;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (loopedIndex: number) => void;
}

/**
 * 휠의 한 칸. 휠은 같은 목록을 수백 칸 깔아 두므로, 선택줄이 움직일 때 상태가 바뀐 칸만 다시 그리도록 memo로 감싼다.
 * 화면 밖 칸은 content-visibility로 레이아웃·페인트를 건너뛴다(높이는 고정값으로 예약).
 */
const DurationWheelOption = ({
  option,
  loopedIndex,
  unit,
  isActive,
  isSelected,
  onSelect,
}: DurationWheelOptionProps) => {
  const handleClick = () => {
    onSelect(loopedIndex);
  };

  return (
    <button
      aria-selected={isSelected}
      className={cn(
        "flex w-full snap-center items-center justify-center border-0 bg-transparent p-0 [content-visibility:auto]",
        isActive ? font.headline1.bold : font.headline2.semiBold
      )}
      onClick={handleClick}
      role="option"
      style={{
        height: WHEEL_ITEM_HEIGHT,
        containIntrinsicSize: `auto ${WHEEL_ITEM_HEIGHT}px`,
        color: isActive ? lightTheme.label.neutral : lightTheme.line.normal,
      }}
      type="button"
    >
      {option}
      <span className={cn(font.body.regular, "ml-[3px]")}>{unit}</span>
    </button>
  );
};

export default memo(DurationWheelOption);

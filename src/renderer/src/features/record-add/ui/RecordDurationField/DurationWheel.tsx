import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useRef } from "react";

import { cn } from "@/shared";
import { triggerSelectionHaptic } from "@/shared/lib";

import { WHEEL_ITEM_HEIGHT, WHEEL_VISIBLE_ITEM_COUNT } from "./constants";

interface DurationWheelProps {
  /** 스크린리더가 어느 휠인지 읽어 주는 이름 */
  label: string;
  options: readonly number[];
  unit: string;
  value: number;
  onChange: (value: number) => void;
}

/** 스크롤이 멈춘 걸 판단하는 시간(ms). iOS 사파리에 scrollend가 없어 이 값으로 대신한다 */
const SCROLL_SETTLE_DELAY = 120;

/** 위아래로 비워 둘 칸 수. 첫 항목과 마지막 항목도 가운데 선택줄에 올 수 있게 한다 */
const EDGE_SPACER_COUNT = (WHEEL_VISIBLE_ITEM_COUNT - 1) / 2;

/**
 * 세로로 굴려서 값을 고르는 휠.
 * CSS 스크롤 스냅으로 칸을 맞추고, 칸이 넘어갈 때마다 네이티브 햅틱을 울려 iOS 휠과 같은 손맛을 낸다.
 */
const DurationWheel = ({ label, options, unit, value, onChange }: DurationWheelProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  // 스크롤 중 마지막으로 햅틱을 울린 칸. 같은 칸에서 여러 번 울리지 않게 기억해 둔다.
  const hapticIndexRef = useRef(options.indexOf(value));
  // 사용자가 굴리는 중에는 밖에서 들어온 값으로 스크롤 위치를 되돌리지 않는다.
  const isUserScrollingRef = useRef(false);

  const selectedIndex = Math.max(options.indexOf(value), 0);
  const spacerHeight = EDGE_SPACER_COUNT * WHEEL_ITEM_HEIGHT;

  const handleScroll = () => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    isUserScrollingRef.current = true;

    const scrolledIndex = Math.round(list.scrollTop / WHEEL_ITEM_HEIGHT);
    const clampedIndex = Math.min(Math.max(scrolledIndex, 0), options.length - 1);

    // 칸을 지나갈 때마다 울려야 휠을 굴리는 느낌이 나서, 멈춘 뒤가 아니라 스크롤 중에 울린다.
    if (clampedIndex !== hapticIndexRef.current) {
      hapticIndexRef.current = clampedIndex;
      triggerSelectionHaptic();
    }

    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;

      const settledValue = options[clampedIndex];

      if (settledValue !== undefined && settledValue !== value) {
        onChange(settledValue);
      }
    }, SCROLL_SETTLE_DELAY);
  };

  const handleOptionClick = (optionIndex: number) => {
    listRef.current?.scrollTo({ top: optionIndex * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
  };

  // 열릴 때와 밖에서 값이 바뀔 때 선택된 칸을 가운데로 맞춘다.
  useEffect(() => {
    const list = listRef.current;

    if (!list || isUserScrollingRef.current) {
      return;
    }

    hapticIndexRef.current = selectedIndex;
    list.scrollTop = selectedIndex * WHEEL_ITEM_HEIGHT;
  }, [selectedIndex]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    },
    []
  );

  return (
    // 선택줄(absolute)보다 나중에 그려져야 고른 값이 가려지지 않아 relative로 띄운다
    <div
      aria-label={label}
      className="scrollbar-hidden relative min-w-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      onScroll={handleScroll}
      ref={listRef}
      role="listbox"
      style={{ height: WHEEL_VISIBLE_ITEM_COUNT * WHEEL_ITEM_HEIGHT }}
      tabIndex={0}
    >
      <div aria-hidden="true" style={{ height: spacerHeight }} />
      {options.map((option, optionIndex) => {
        const isSelected = optionIndex === selectedIndex;

        return (
          <button
            aria-selected={isSelected}
            className={cn(
              "flex w-full snap-center items-center justify-center border-0 bg-transparent p-0",
              isSelected ? font.headline1.bold : font.headline2.semiBold
            )}
            key={option}
            onClick={() => handleOptionClick(optionIndex)}
            role="option"
            style={{
              height: WHEEL_ITEM_HEIGHT,
              color: isSelected ? lightTheme.label.neutral : lightTheme.line.normal,
            }}
            type="button"
          >
            {option}
            <span className={cn(font.body.regular, "ml-[3px]")}>{unit}</span>
          </button>
        );
      })}
      <div aria-hidden="true" style={{ height: spacerHeight }} />
    </div>
  );
};

export default DurationWheel;

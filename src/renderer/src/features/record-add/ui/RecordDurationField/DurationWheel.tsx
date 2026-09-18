import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared";
import { triggerSelectionHaptic } from "@/shared/lib";

import {
  WHEEL_EDGE_ITEM_COUNT,
  WHEEL_ITEM_HEIGHT,
  WHEEL_VISIBLE_ITEM_COUNT,
  getWheelRepeatCount,
} from "./constants";

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

/**
 * 세로로 굴려서 값을 고르는 휠.
 *
 * 아이폰 알람처럼 끝과 처음이 이어지고, 선택줄에 닿는 순간 바로 색이 바뀐다.
 * - 순환: 같은 목록을 여러 벌 깔아 두고 가운데 벌에서 시작한다. 끝 쪽 한 벌 안으로 들어오면
 *   스크롤 도중이라도 가운데 벌로 되돌린다. 내용이 같은 자리라 화면에는 변화가 없다.
 * - 색: 스크롤 도중에도 가운데 칸을 계산해 즉시 반영한다(값 확정은 멈춘 뒤).
 */
const DurationWheel = ({ label, options, unit, value, onChange }: DurationWheelProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  // 사용자가 굴리는 중에는 밖에서 들어온 값으로 스크롤 위치를 되돌리지 않는다.
  const isUserScrollingRef = useRef(false);
  // 선택줄에 놓인 칸을 "몇 번째 벌의 몇 번째"까지 그대로 기억한다.
  // 색은 어느 벌이든 같은 숫자면 같이 바뀌고, aria-selected는 실제 그 칸 하나에만 단다.
  const [activeLoopedIndex, setActiveLoopedIndex] = useState(
    () =>
      ((getWheelRepeatCount(options.length) - 1) / 2) * options.length +
      Math.max(options.indexOf(value), 0)
  );

  const repeatCount = useMemo(() => getWheelRepeatCount(options.length), [options.length]);
  const middleBlockIndex = (repeatCount - 1) / 2;
  const blockLength = options.length * WHEEL_ITEM_HEIGHT;
  const activeIndex = ((activeLoopedIndex % options.length) + options.length) % options.length;

  /** 같은 후보를 여러 벌 이어 붙인 실제 렌더 목록 */
  const loopedOptions = useMemo(
    () =>
      Array.from(
        { length: repeatCount * options.length },
        (_, loopedIndex) => options[loopedIndex % options.length] as number
      ),
    [options, repeatCount]
  );

  /** 지금 보고 있는 칸을 그대로 둔 채 스크롤 위치만 가운데 벌로 옮긴다 */
  const recenterToMiddleBlock = (list: HTMLDivElement) => {
    const offsetInBlock = ((list.scrollTop % blockLength) + blockLength) % blockLength;

    list.scrollTop = middleBlockIndex * blockLength + offsetInBlock;
  };

  const handleScroll = () => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    isUserScrollingRef.current = true;

    const centeredLoopedIndex =
      Math.round(list.scrollTop / WHEEL_ITEM_HEIGHT) + WHEEL_EDGE_ITEM_COUNT;
    const centeredIndex =
      ((centeredLoopedIndex % options.length) + options.length) % options.length;

    // 칸을 지나갈 때마다 색을 바꾸고 햅틱을 울려야 휠을 굴리는 느낌이 난다.
    if (centeredLoopedIndex !== activeLoopedIndex) {
      setActiveLoopedIndex(centeredLoopedIndex);
    }

    if (centeredIndex !== activeIndex) {
      triggerSelectionHaptic();
    }

    // 끝 쪽 한 벌 안으로 들어오면 관성이 끝에 박히기 전에 되돌린다.
    // 여기서 멈추면 더 굴러가지 않고 끊겨서, 멈춘 뒤가 아니라 지금 옮겨야 한다.
    if (list.scrollTop < blockLength || list.scrollTop > (repeatCount - 2) * blockLength) {
      recenterToMiddleBlock(list);
      setActiveLoopedIndex(middleBlockIndex * options.length + centeredIndex);
    }

    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;

      // 멈춘 김에 가운데 벌로 돌려놔 다음 제스처도 양쪽 거리를 넉넉히 쓰게 한다.
      recenterToMiddleBlock(list);
      setActiveLoopedIndex(middleBlockIndex * options.length + centeredIndex);

      const settledValue = options[centeredIndex];

      if (settledValue !== undefined && settledValue !== value) {
        onChange(settledValue);
      }
    }, SCROLL_SETTLE_DELAY);
  };

  const handleOptionClick = (loopedIndex: number) => {
    listRef.current?.scrollTo({
      top: (loopedIndex - WHEEL_EDGE_ITEM_COUNT) * WHEEL_ITEM_HEIGHT,
      behavior: "smooth",
    });
  };

  // 열릴 때와 밖에서 값이 바뀔 때 고른 칸을 가운데 벌의 선택줄에 맞춘다.
  useEffect(() => {
    const list = listRef.current;

    if (!list || isUserScrollingRef.current) {
      return;
    }

    const optionIndex = Math.max(options.indexOf(value), 0);

    setActiveLoopedIndex(middleBlockIndex * options.length + optionIndex);
    list.scrollTop =
      (middleBlockIndex * options.length + optionIndex - WHEEL_EDGE_ITEM_COUNT) * WHEEL_ITEM_HEIGHT;
  }, [middleBlockIndex, options, value]);

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
      {loopedOptions.map((option, loopedIndex) => {
        const isActive = loopedIndex % options.length === activeIndex;

        return (
          <button
            aria-selected={loopedIndex === activeLoopedIndex}
            className={cn(
              "flex w-full snap-center items-center justify-center border-0 bg-transparent p-0",
              isActive ? font.headline1.bold : font.headline2.semiBold
            )}
            key={`${loopedIndex}-${option}`}
            onClick={() => handleOptionClick(loopedIndex)}
            role="option"
            style={{
              height: WHEEL_ITEM_HEIGHT,
              color: isActive ? lightTheme.label.neutral : lightTheme.line.normal,
            }}
            type="button"
          >
            {option}
            <span className={cn(font.body.regular, "ml-[3px]")}>{unit}</span>
          </button>
        );
      })}
    </div>
  );
};

export default DurationWheel;

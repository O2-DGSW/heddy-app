import { lightTheme } from "@heddy/design-tokens";

import { CutsGridViewIcon } from "@/features/cuts/ui/icons/CutsGridViewIcon";
import { CutsListViewIcon } from "@/features/cuts/ui/icons/CutsListViewIcon";
import type { CutsViewMode } from "@/features/cuts/model/types/CutsViewMode.types";
import type { ComponentType } from "react";

interface CutsViewModeToggleProps {
  selected: CutsViewMode;
  onSelect: (viewMode: CutsViewMode) => void;
}

/** 누르면 넘어갈 보기 방식 */
const NEXT_VIEW_MODE = {
  list: "grid",
  grid: "list",
} as const satisfies Record<CutsViewMode, CutsViewMode>;

const VIEW_MODE_ICON = {
  grid: CutsGridViewIcon,
  list: CutsListViewIcon,
} as const satisfies Record<CutsViewMode, ComponentType>;

const VIEW_MODE_LABEL = {
  grid: "그리드로 보기",
  list: "리스트로 보기",
} as const satisfies Record<CutsViewMode, string>;

const buttonStyle = {
  backgroundColor: lightTheme.fill.neutral,
  color: lightTheme.primary.normal,
};

/**
 * 시술기록 목록의 배치를 그리드↔리스트로 바꾸는 버튼.
 * 버튼이 하나라 지금 상태가 아니라 "누르면 될 모습"을 아이콘으로 보여준다 —
 * 두 아이콘을 늘어놓고 고르게 하는 것보다 누를 곳이 하나여서 헷갈리지 않는다.
 */
export const CutsViewModeToggle = ({ selected, onSelect }: CutsViewModeToggleProps) => {
  const nextViewMode = NEXT_VIEW_MODE[selected];
  const NextViewModeIcon = VIEW_MODE_ICON[nextViewMode];

  return (
    <button
      aria-label={VIEW_MODE_LABEL[nextViewMode]}
      className="mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 p-2 transition-colors duration-200 max-[400px]:h-8 max-[400px]:w-8 max-[400px]:p-1.5"
      onClick={() => onSelect(nextViewMode)}
      style={buttonStyle}
      type="button"
    >
      <NextViewModeIcon />
    </button>
  );
};

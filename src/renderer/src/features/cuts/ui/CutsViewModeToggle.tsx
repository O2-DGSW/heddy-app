import { lightTheme } from "@heddy/design-tokens";

import { CutsGridViewIcon } from "@/features/cuts/ui/icons/CutsGridViewIcon";
import { CutsListViewIcon } from "@/features/cuts/ui/icons/CutsListViewIcon";
import type { CutsViewMode } from "@/features/cuts/model/types/CutsViewMode.types";
import type { ComponentType } from "react";

interface CutsViewModeToggleProps {
  selected: CutsViewMode;
  onSelect: (viewMode: CutsViewMode) => void;
}

const VIEW_MODE_BUTTONS = [
  { viewMode: "grid", label: "그리드로 보기", Icon: CutsGridViewIcon },
  { viewMode: "list", label: "리스트로 보기", Icon: CutsListViewIcon },
] as const satisfies readonly { viewMode: CutsViewMode; label: string; Icon: ComponentType }[];

/**
 * 시술기록 목록을 그리드/리스트 중 어떤 형태로 볼지 고르는 버튼.
 * 고른 쪽만 포인트 색으로 칠해 지금 어느 보기인지 한눈에 보이게 한다.
 */
export const CutsViewModeToggle = ({ selected, onSelect }: CutsViewModeToggleProps) => {
  return (
    <div aria-label="목록 보기 방식" className="flex shrink-0 items-center gap-1 pr-4" role="group">
      {VIEW_MODE_BUTTONS.map(({ viewMode, label, Icon }) => {
        const isActive = viewMode === selected;

        return (
          <button
            aria-label={label}
            aria-pressed={isActive}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-0 p-2 transition-colors duration-200 max-[400px]:h-8 max-[400px]:w-8 max-[400px]:p-1.5"
            key={viewMode}
            onClick={() => onSelect(viewMode)}
            style={{
              backgroundColor: isActive ? lightTheme.fill.neutral : "transparent",
              color: isActive ? lightTheme.primary.normal : lightTheme.label.assistive,
            }}
            type="button"
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

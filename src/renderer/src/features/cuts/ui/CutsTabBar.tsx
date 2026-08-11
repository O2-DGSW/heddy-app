import { font, lightTheme } from "@design-tokens";

import { CUTS_TABS, type CutsStatusFilter } from "@/features/cuts/constrants/tabs";

interface CutsTabBarProps {
  selected: CutsStatusFilter;
  onSelect: (filter: CutsStatusFilter) => void;
}

/**
 * 시술기록 상태 필터 탭
 * - 페이지 이동이 아니라 같은 목록을 상태별로 걸러보는 필터라서
 *   라우팅(NavLink) 대신 선택 상태를 부모로부터 받아 클릭으로 바꾼다.
 */
export const CutsTabBar = ({ selected, onSelect }: CutsTabBarProps) => {
  return (
    <nav className="flex" style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}>
      {CUTS_TABS.map(({ label }) => {
        const isActive = label === selected;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`relative flex-1 flex flex-col items-center px-2 py-3 transition-colors ${font.label.medium}`}
            style={{ color: isActive ? lightTheme.label.strong : lightTheme.label.assistive }}
          >
            {label}
            {isActive && (
              <div
                className="absolute -bottom-px h-0.75 w-12 rounded-full"
                style={{ backgroundColor: lightTheme.label.strong }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

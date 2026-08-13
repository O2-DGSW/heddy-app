import { font, lightTheme } from "@heddy/design-tokens";

import { useTabIndicator } from "@/features/cuts/model/hooks/useTabIndicator";
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
  const { indicatorLeftPercent } = useTabIndicator(selected);

  return (
    <nav
      className="relative flex"
      style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
    >
      {CUTS_TABS.map(({ label }) => {
        const isActive = label === selected;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className={`flex-1 flex flex-col items-center px-2 py-3 transition-colors duration-200 ${font.label.medium}`}
            style={{ color: isActive ? lightTheme.label.strong : lightTheme.label.assistive }}
          >
            {label}
          </button>
        );
      })}

      {/* 탭마다 밑줄을 따로 그리지 않고, 하나의 밑줄을 활성 탭 위치로 이동시켜서 자연스럽게 이어지는 것처럼 보이게 한다. */}
      <div
        className="absolute -bottom-px h-0.75 w-12 rounded-full transition-[left] duration-200 ease-out"
        style={{
          backgroundColor: lightTheme.label.strong,
          left: `${indicatorLeftPercent}%`,
          transform: "translateX(-50%)",
        }}
      />
    </nav>
  );
};

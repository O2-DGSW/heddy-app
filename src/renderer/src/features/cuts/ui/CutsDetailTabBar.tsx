import { NavLink, useLocation } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { useTabIndicator } from "@/features/cuts/model/hooks/useTabIndicator";
import { CUTS_DETAIL_TABS } from "@/features/cuts/constrants/detailTabs";

/**
 * 시술 상세 정보/분석 탭
 * - 탭마다 별도 라우트(정보/분석완료)를 갖는 화면 전환이라 CutsTabBar와 달리 NavLink로 이동한다.
 */
export const CutsDetailTabBar = () => {
  const { pathname } = useLocation();
  const selectedIndex = CUTS_DETAIL_TABS.findIndex(({ path }) => pathname.endsWith(path));
  const { indicatorLeftPercent } = useTabIndicator(CUTS_DETAIL_TABS.length, selectedIndex);

  return (
    <nav
      className="relative flex"
      style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
    >
      {CUTS_DETAIL_TABS.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          end
          replace
          className={`flex-1 flex flex-col items-center px-2 py-3 transition-colors duration-200 ${font.label.medium}`}
          style={({ isActive }) => ({
            color: isActive ? lightTheme.label.strong : lightTheme.label.assistive,
          })}
        >
          {label}
        </NavLink>
      ))}

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

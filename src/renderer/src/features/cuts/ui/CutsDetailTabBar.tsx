import { NavLink, useLocation } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { useTabIndicator } from "@/features/cuts/model/hooks/useTabIndicator";
import { CUTS_DETAIL_TABS } from "@/features/cuts/constants/detailTabs";

/**
 * 시술 상세 정보/분석 탭
 * - 탭마다 별도 라우트(정보/분석완료)를 갖는 화면 전환이라 CutsTabBar와 달리 NavLink로 이동한다.
 */
export const CutsDetailTabBar = () => {
  const { pathname } = useLocation();
  const selectedIndex = CUTS_DETAIL_TABS.findIndex(({ path }) => pathname.endsWith(path));
  const { tabWidthPercent, indicatorTranslatePercent } = useTabIndicator(
    CUTS_DETAIL_TABS.length,
    selectedIndex
  );

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
        aria-hidden="true"
        className="absolute -bottom-px left-0 flex justify-center transition-transform duration-200 ease-out"
        style={{
          width: `${tabWidthPercent}%`,
          transform: `translateX(${indicatorTranslatePercent}%)`,
        }}
      >
        <div
          className="h-0.75 w-12 rounded-full"
          style={{ backgroundColor: lightTheme.label.strong }}
        />
      </div>
    </nav>
  );
};

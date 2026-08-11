import { NavLink } from "react-router-dom";

import { font, lightTheme } from "@design-tokens";

/** 탭 아이템 타입 */
export interface TabItem {
  label: string;
  to: string;
}

/** TabBar 컴포넌트 props */
interface TabBarProps {
  /** 탭 목록 */
  tabs: readonly TabItem[];
}

/**
 * 공통 탭바 컴포넌트
 * @param props {@link TabBarProps}
 */
export const TabBar = ({ tabs }: TabBarProps) => {
  return (
    <nav className="flex" style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={`relative flex-1 flex flex-col items-center px-2 py-3 transition-colors ${font.label.medium}`}
          style={({ isActive }) => ({
            color: isActive ? lightTheme.label.strong : lightTheme.label.assistive,
          })}
        >
          {({ isActive }) => (
            <>
              {tab.label}
              {isActive && (
                <div
                  className="absolute -bottom-px h-0.75 w-12 rounded-full"
                  style={{ backgroundColor: lightTheme.label.strong }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

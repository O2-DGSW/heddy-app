import { useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "../constants/nav-items.ts";
import { getBarItemState } from "../model/focusEffect";
import { BarItem } from "./BarItem";
import { lightTheme } from "@heddy/design-tokens";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="하단 메뉴"
      className="
        flex w-full
        min-h-[4.5rem] px-[1.75rem] py-[0.5rem]
        items-center justify-between
        shadow-[0_-2px_6px_rgba(0,0,0,0.05)]
        rounded-tl-4xl rounded-tr-3xl
      "
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {NAV_ITEMS.map(({ Icon, title, to }) => {
        const state = getBarItemState(location.pathname, to);

        return (
          <BarItem
            key={to}
            Icon={Icon}
            isActive={state.isActive}
            title={title}
            iconColor={state.iconColor}
            backgroundColor={state.backgroundColor}
            textColor={state.textColor}
            onClick={() => navigate(to)}
          />
        );
      })}
    </nav>
  );
};

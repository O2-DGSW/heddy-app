import { lightTheme } from "@heddy/design-tokens";
import { useLocation, useNavigate } from "react-router-dom";

import { NAV_ITEMS } from "../../constants/nav-items";
import { getBarItemState } from "../../model/focusEffect";
import BarItem from "../BarItem";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (to: string) => {
    navigate(to);
  };

  return (
    <nav
      aria-label="하단 메뉴"
      className="flex h-[106px] w-full items-start justify-center gap-[44px] rounded-tl-[20px] rounded-tr-[20px] pt-[16px] shadow-[0_-2px_6px_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {NAV_ITEMS.map(({ Icon, title, to }) => {
        const state = getBarItemState(location.pathname, to);

        return (
          <BarItem
            Icon={Icon}
            backgroundColor={state.backgroundColor}
            iconColor={state.iconColor}
            isActive={state.isActive}
            key={to}
            onClick={() => handleNavigation(to)}
            textColor={state.textColor}
            title={title}
          />
        );
      })}
    </nav>
  );
};

export default NavBar;

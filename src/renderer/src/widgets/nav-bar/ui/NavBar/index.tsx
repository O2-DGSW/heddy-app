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
    // 높이를 고정값 대신 콘텐츠(pt-16 + 아이템)와 pb-[max(16px, 세이프에어리어)]로 결정한다.
    // 이 총합이 global.css의 --nav-bar-height와 같아지도록 맞춰뒀다 — 기기마다 세이프에어리어가
    // 달라도 NavBar 실제 높이와 다른 곳의 여백 계산이 항상 일치한다. 최소 16px는 세이프에어리어가
    // 없는 기기(홈버튼 iPhone 등)에서 라벨 텍스트가 실기기에서 잘리지 않도록 하는 여유분이다.
    <nav
      aria-label="하단 메뉴"
      className="flex w-full items-start justify-center gap-[clamp(34px,10.95vw,44px)] pb-[max(16px,var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] pt-[16px] shadow-[0_-2px_6px_rgba(0,0,0,0.05)]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {NAV_ITEMS.map(({ Icon, iconClassName, title, to }) => {
        const state = getBarItemState(location.pathname, to);

        return (
          <BarItem
            Icon={Icon}
            backgroundColor={state.backgroundColor}
            iconClassName={iconClassName}
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

import { lightTheme, palette } from "@heddy/design-tokens";
import { Outlet, useLocation } from "react-router-dom";

import { cn } from "../../../shared";
import { NavBar } from "../../../widgets/nav-bar";

const MobileLayout = () => {
  const location = useLocation();

  const hideBottomBar =
    ["/login", "/signup"].includes(location.pathname) || location.pathname.startsWith("/find/");

  return (
    <div
      className="flex h-dvh w-full justify-center overflow-hidden"
      style={{ backgroundColor: palette.neutral[95] }}
    >
      <div
        className="relative flex h-dvh w-full transform-gpu flex-col overflow-hidden sm:max-w-[402px] sm:rounded-[44px] sm:shadow-[0_0_24px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <main
          className={cn(
            "min-h-0 flex-1 overflow-y-auto scrollbar-hidden",
            hideBottomBar ? "pb-safe" : "pb-[106px]"
          )}
        >
          <Outlet />
        </main>
        {!hideBottomBar && (
          <div className="absolute inset-x-0 bottom-0 w-full">
            <NavBar />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLayout;

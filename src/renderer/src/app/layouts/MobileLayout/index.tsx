import { lightTheme, palette } from "@heddy/design-tokens";
import { Outlet, useLocation } from "react-router-dom";

import { cn } from "../../../shared";
import { NavBar } from "../../../widgets/nav-bar";
import batteryIcon from "../assets/battery.svg";
import cellularConnectionIcon from "../assets/cellular-connection.svg";
import wifiIcon from "../assets/wifi.svg";

const StatusBar = () => {
  return (
    <div className="flex h-[54px] w-full shrink-0 items-start pt-[21px]">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-1 items-center justify-center pl-[16px] pr-[6px]">
          <span
            className="text-center text-[17px] font-semibold leading-[22px]"
            style={{ color: lightTheme.label.strong }}
          >
            9:41
          </span>
        </div>
        <div className="h-[10px] w-[124px] shrink-0" />
        <div className="flex flex-1 items-center justify-center gap-[7px] pl-[6px] pr-[16px]">
          <img alt="" className="h-[12.226px] w-[19.2px]" src={cellularConnectionIcon} />
          <img alt="" className="h-[12.328px] w-[17.142px]" src={wifiIcon} />
          <img alt="" className="h-[13px] w-[27.328px]" src={batteryIcon} />
        </div>
      </div>
    </div>
  );
};

const HomeIndicator = () => {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34px]">
      <div
        className="absolute bottom-[8px] left-1/2 h-[5px] w-[144px] -translate-x-1/2 rounded-full"
        style={{ backgroundColor: lightTheme.label.strong }}
      />
    </div>
  );
};

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
        className={cn(
          "relative flex h-dvh w-full transform-gpu flex-col overflow-hidden",
          "sm:rounded-[44px] sm:shadow-[0_0_24px_rgba(0,0,0,0.05)]",
          import.meta.env.DEV && "sm:max-w-[402px]"
        )}
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <StatusBar />
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
            <HomeIndicator />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLayout;

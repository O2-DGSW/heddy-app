import { Capacitor } from "@capacitor/core";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../../widgets/nav-bar";
import {
  PAGE_SCROLL_PATHS,
  BOTTOM_BAR_HIDDEN_PREFIXES,
  BOTTOM_BAR_HIDDEN_PATHS,
} from "@/app/layouts/constant/layout.ts";

const MobileLayout = () => {
  const location = useLocation();
  const isBrowserDevicePreview = import.meta.env.DEV && !Capacitor.isNativePlatform();
  const usePageScroll = PAGE_SCROLL_PATHS.some(pathPrefix =>
    location.pathname.startsWith(pathPrefix)
  );

  const hideBottomBar =
    BOTTOM_BAR_HIDDEN_PATHS.includes(location.pathname) ||
    BOTTOM_BAR_HIDDEN_PREFIXES.some(pathPrefix => location.pathname.startsWith(pathPrefix));

  return (
    <div
      className={`flex min-h-dvh w-full justify-center bg-gray-100 ${isBrowserDevicePreview ? "sm:items-center sm:bg-white sm:p-[16px]" : ""}`}
    >
      <div
        className={
          isBrowserDevicePreview
            ? "contents sm:flex sm:aspect-[43/90] sm:h-[min(900px,calc(100dvh-32px))] sm:w-auto sm:shrink-0 sm:rounded-[64px] sm:bg-[#1C1C1E] sm:px-[3.2558%] sm:py-[3.0233%] sm:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
            : "contents"
        }
      >
        <div
          className={`relative flex h-dvh w-full transform-gpu flex-col overflow-hidden bg-white sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] ${isBrowserDevicePreview ? "sm:h-full sm:rounded-[50px] sm:border-0 sm:shadow-none sm:[--safe-area-inset-top:59px] sm:[--safe-area-inset-bottom:34px]" : ""}`}
        >
          <main
            className={`min-h-0 flex-1 overscroll-contain px-safe pt-safe no-scrollbar ${usePageScroll ? "overflow-hidden" : "touch-pan-y overflow-y-scroll [-webkit-overflow-scrolling:touch]"} ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
          >
            <Outlet />
          </main>
          {/* iOS WebView는 CSS만으로 내부 스크롤의 bounce(러버밴드)를 완전히 막을 수 없어서,
              스크롤을 아무리 당겨도 이 영역이 항상 배경색으로 덮여 있도록
              세이프에어리어 상단을 별도 레이어로 고정한다. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-white pt-safe" />
          {isBrowserDevicePreview && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[13px] z-30 hidden h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black sm:block"
            />
          )}
          {!hideBottomBar && (
            <div className="absolute inset-x-0 bottom-0 w-full">
              <NavBar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { MobileLayout };

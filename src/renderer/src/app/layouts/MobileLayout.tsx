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
      className={`flex min-h-dvh w-full justify-center bg-gray-100 ${isBrowserDevicePreview ? "sm:items-center sm:bg-white sm:p-6" : ""}`}
    >
      <div
        className={
          isBrowserDevicePreview
            ? "contents sm:relative sm:flex sm:aspect-[43/90] sm:h-[min(900px,calc(100dvh-48px))] sm:w-auto sm:min-w-0 sm:shrink-0 sm:rounded-[64px] sm:bg-[#1C1C1E] sm:px-[14px] sm:py-[13px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.2)] sm:ring-1 sm:ring-black/10"
            : "contents"
        }
      >
        {isBrowserDevicePreview && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[2px] top-[19%] z-10 hidden h-[4.5%] w-[3px] rounded-l-full bg-[#2C2C2E] sm:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[2px] top-[29%] z-10 hidden h-[6.5%] w-[3px] rounded-l-full bg-[#2C2C2E] sm:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[2px] top-[37%] z-10 hidden h-[6.5%] w-[3px] rounded-l-full bg-[#2C2C2E] sm:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-[2px] top-[30%] z-10 hidden h-[10%] w-[3px] rounded-r-full bg-[#2C2C2E] sm:block"
            />
          </>
        )}
        <div
          className={`relative flex h-dvh w-full transform-gpu flex-col overflow-hidden bg-white ${isBrowserDevicePreview ? "sm:h-auto sm:min-h-0 sm:flex-1 sm:rounded-[51px] sm:border sm:border-white/70 sm:shadow-none sm:[--safe-area-inset-top:59px] sm:[--safe-area-inset-bottom:34px]" : "sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)]"}`}
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
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[8.7%] top-[2.75%] z-30 hidden items-center justify-between text-[16px] font-bold leading-none tracking-[-0.03em] text-black sm:flex"
              >
                <div className="flex items-center gap-[4px]">
                  <span>9:41</span>
                  <span className="relative h-[12px] w-[12px] rounded-full bg-black after:absolute after:-right-[2px] after:-top-[2px] after:h-[12px] after:w-[12px] after:rounded-full after:bg-white" />
                </div>
                <div className="flex items-center gap-[6px]">
                  <svg className="h-[14px] w-[20px]" viewBox="0 0 20 14">
                    <rect height="5" rx="1.5" width="3.5" x="0" y="9" fill="currentColor" />
                    <rect height="8" rx="1.5" width="3.5" x="5.5" y="6" fill="currentColor" />
                    <rect
                      height="11"
                      rx="1.5"
                      width="3.5"
                      x="11"
                      y="3"
                      fill="currentColor"
                      opacity="0.25"
                    />
                    <rect
                      height="14"
                      rx="1.5"
                      width="3.5"
                      x="16.5"
                      y="0"
                      fill="currentColor"
                      opacity="0.25"
                    />
                  </svg>
                  <span className="text-[14px] font-bold tracking-[-0.02em]">5G</span>
                  <span className="relative flex h-[14px] w-[27px] items-center justify-center rounded-[5px] bg-[#C7C7CC] text-[12px] font-bold leading-none after:absolute after:-right-[2px] after:top-1/2 after:h-[6px] after:w-[2px] after:-translate-y-1/2 after:rounded-r-full after:bg-[#C7C7CC]">
                    <span className="absolute inset-y-0 left-0 w-[80%] rounded-l-[5px] bg-[#FFD11A]" />
                    <span className="relative">80</span>
                  </span>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[1.4874%] z-30 hidden h-[4.2334%] w-[31.3433%] -translate-x-1/2 rounded-full bg-black sm:block"
              />
            </>
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

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../../widgets/nav-bar";
import { BottomBarVisibilityProvider, useBottomBarVisibility } from "@/shared";
import {
  PAGE_SCROLL_PATHS,
  BOTTOM_BAR_HIDDEN_PREFIXES,
  BOTTOM_BAR_HIDDEN_PATHS,
} from "@/app/layouts/constant/layout.ts";

const DEVICE_FRAME_WIDTH = 430;
const DEVICE_FRAME_HEIGHT = 900;
const DEVICE_PREVIEW_PADDING = 48;

const getBrowserViewport = () => ({
  width: typeof window === "undefined" ? 0 : window.innerWidth,
  height: typeof window === "undefined" ? 0 : window.innerHeight,
});

const useBrowserDevicePreview = () => {
  const [viewport, setViewport] = useState(getBrowserViewport);

  useEffect(() => {
    if (!import.meta.env.DEV || Capacitor.isNativePlatform()) {
      return;
    }

    const updateViewport = () => setViewport(getBrowserViewport());

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const isBrowserDevelopment = import.meta.env.DEV && !Capacitor.isNativePlatform();
  const isUnsupportedViewport = isBrowserDevelopment && viewport.width < 640;
  const isBrowserDevicePreview = isBrowserDevelopment && !isUnsupportedViewport;
  const devicePreviewScale = isBrowserDevicePreview
    ? Math.min(1, Math.max(0, (viewport.height - DEVICE_PREVIEW_PADDING) / DEVICE_FRAME_HEIGHT))
    : 1;

  return { isBrowserDevicePreview, isUnsupportedViewport, devicePreviewScale };
};

const MobileLayoutContent = () => {
  const location = useLocation();
  const { isBottomBarHidden } = useBottomBarVisibility();
  const { isBrowserDevicePreview, isUnsupportedViewport, devicePreviewScale } =
    useBrowserDevicePreview();
  const usePageScroll = PAGE_SCROLL_PATHS.some(pathPrefix =>
    location.pathname.startsWith(pathPrefix)
  );

  const hideBottomBar =
    BOTTOM_BAR_HIDDEN_PATHS.includes(location.pathname) ||
    BOTTOM_BAR_HIDDEN_PREFIXES.some(pathPrefix => location.pathname.startsWith(pathPrefix)) ||
    isBottomBarHidden;
  const reserveBottomSafeArea = hideBottomBar && location.pathname !== "/ar";

  if (isUnsupportedViewport) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-gray-100 px-6">
        <p className="text-center text-sm font-medium text-gray-600">지원하지 않는 크기입니다.</p>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-dvh w-full justify-center bg-gray-100 ${isBrowserDevicePreview ? "sm:items-center sm:bg-white sm:p-6" : ""}`}
    >
      <div
        className={
          isBrowserDevicePreview
            ? "contents sm:flex sm:shrink-0 sm:items-center sm:justify-center"
            : "contents"
        }
        style={
          isBrowserDevicePreview
            ? {
                height: `${DEVICE_FRAME_HEIGHT * devicePreviewScale}px`,
                width: `${DEVICE_FRAME_WIDTH * devicePreviewScale}px`,
              }
            : undefined
        }
      >
        <div
          className={
            isBrowserDevicePreview
              ? "contents sm:relative sm:flex sm:h-[900px] sm:w-[430px] sm:shrink-0 sm:rounded-[64px] sm:bg-[#1C1C1E] sm:px-[14px] sm:py-[13px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.2)] sm:ring-1 sm:ring-black/10"
              : "contents"
          }
          style={isBrowserDevicePreview ? { transform: `scale(${devicePreviewScale})` } : undefined}
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
              className={`min-h-0 flex-1 overscroll-none px-safe pt-safe no-scrollbar ${usePageScroll ? "overflow-hidden" : "touch-pan-y overflow-y-auto [-webkit-overflow-scrolling:touch]"} ${reserveBottomSafeArea ? "pb-safe" : "pb-0"}`}
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
                  className="pointer-events-none absolute inset-x-[8.7%] top-[2.75%] z-30 hidden items-center justify-between leading-none text-black sm:flex"
                >
                  <span
                    className="text-[17px] font-bold tracking-normal tabular-nums"
                    style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    9:41
                  </span>
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
                    <span className="relative flex h-[14px] w-[29px] items-center justify-center text-[12px] font-bold leading-none">
                      <span className="absolute inset-y-0 left-0 right-[2px] rounded-[5px] bg-[#C7C7CC]" />
                      <span className="absolute inset-y-0 left-0 right-[2px] overflow-hidden rounded-[5px]">
                        <span className="absolute inset-y-0 left-0 w-[80%] bg-[#FFD11A]" />
                      </span>
                      <span className="absolute right-0 top-1/2 h-[6px] w-[2px] -translate-y-1/2 rounded-r-full bg-[#C7C7CC]" />
                      <span className="relative -translate-x-px">80</span>
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
              <div className="w-full shrink-0">
                <NavBar />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileLayout = () => {
  return (
    <BottomBarVisibilityProvider>
      <MobileLayoutContent />
    </BottomBarVisibilityProvider>
  );
};

export { MobileLayout };

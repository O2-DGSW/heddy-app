import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../../widgets/nav-bar";
import {
  PAGE_SCROLL_PATHS,
  BOTTOM_BAR_HIDDEN_PREFIXES,
  BOTTOM_BAR_HIDDEN_PATHS,
} from "@/app/layouts/constant/layout.ts";

const MobileLayout = () => {
  const location = useLocation();
  const frameWidthClassName = import.meta.env.DEV ? "sm:max-w-[430px]" : "";
  const usePageScroll = PAGE_SCROLL_PATHS.some(pathPrefix =>
    location.pathname.startsWith(pathPrefix)
  );

  const hideBottomBar =
    BOTTOM_BAR_HIDDEN_PATHS.includes(location.pathname) ||
    BOTTOM_BAR_HIDDEN_PREFIXES.some(pathPrefix => location.pathname.startsWith(pathPrefix));

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div
        className={`relative flex h-dvh w-full transform-gpu flex-col overflow-hidden bg-white sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] ${frameWidthClassName}`}
      >
        <main
          className={`min-h-0 flex-1 overscroll-none px-safe pt-safe no-scrollbar ${usePageScroll ? "overflow-hidden" : "touch-pan-y overflow-y-auto [-webkit-overflow-scrolling:touch]"} ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
        >
          <Outlet />
        </main>
        {/* iOS WebView는 CSS만으로 내부 스크롤의 bounce(러버밴드)를 완전히 막을 수 없어서,
            스크롤을 아무리 당겨도 이 영역이 항상 배경색으로 덮여 있도록
            세이프에어리어 상단을 별도 레이어로 고정한다. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-white pt-safe" />
        {!hideBottomBar && (
          <div className="absolute inset-x-0 bottom-0 w-full">
            <NavBar />
          </div>
        )}
      </div>
    </div>
  );
};

export { MobileLayout };

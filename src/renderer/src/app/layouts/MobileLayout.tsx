import { Outlet, useLocation } from "react-router-dom";

import { NavBar } from "../../widgets/nav-bar";

const MobileLayout = () => {
  const location = useLocation();
  const frameWidthClassName = import.meta.env.DEV ? "sm:max-w-[430px]" : "";

  const hideBottomBar =
    ["/login", "/signup", "/welcome", "/find-id", "/find-password"].includes(location.pathname) ||
    location.pathname.startsWith("/find/");

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div
        className={`relative flex h-dvh w-full transform-gpu flex-col overflow-hidden bg-white sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] ${frameWidthClassName}`}
      >
        <main
          className={`flex-1 overflow-y-auto overscroll-contain px-safe pt-safe no-scrollbar ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
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

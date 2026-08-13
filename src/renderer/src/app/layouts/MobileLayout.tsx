import { Outlet, useLocation } from "react-router-dom";

import { NavBar } from "../../widgets/nav-bar";

const MobileLayout = () => {
  const location = useLocation();
  const frameWidthClassName = import.meta.env.DEV ? "sm:max-w-[430px]" : "";

  const hideBottomBar =
    ["/login", "/signup","/welcome"].includes(location.pathname) || location.pathname.startsWith("/find/");

  return (
    <div className="flex min-h-dvh w-full justify-center bg-gray-100">
      <div
        className={`relative flex h-dvh w-full transform-gpu flex-col overflow-hidden bg-white sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] ${frameWidthClassName}`}
      >
        <main
          className={`flex-1 overflow-y-auto px-safe pt-safe no-scrollbar ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
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

export { MobileLayout };

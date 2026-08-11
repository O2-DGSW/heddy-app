import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../../widgets/nav-bar/ui/NavBar.tsx";

const MobileLayout = () => {
  const location = useLocation();
  const frameWidthClassName = import.meta.env.DEV ? "sm:max-w-[430px]" : "";

  const hideBottomBar =
    ["/login", "/signup"].includes(location.pathname) || location.pathname.startsWith("/find/");

  return (
    <div className="min-h-dvh w-full bg-gray-100 flex justify-center">
      <div
        className={`w-full ${frameWidthClassName} bg-white h-dvh relative flex flex-col sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] transform-gpu overflow-hidden`}
      >
        <main
          className={`flex-1 overflow-y-auto no-scrollbar pt-safe px-safe ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
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

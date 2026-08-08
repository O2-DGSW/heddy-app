import { Outlet, useLocation } from "react-router-dom";
import { BottomBar } from "@/widgets/bottom-bar";

const MobileLayout = () => {
  const location = useLocation();

  const hideBottomBar =
    ["/login", "/signup"].includes(location.pathname) || location.pathname.startsWith("/find/");

  return (
    <div className="min-h-dvh bg-gray-100 flex justify-center">
      <div className="w-full sm:w-[430px] bg-white h-dvh relative flex flex-col sm:border-x sm:border-gray-200 sm:shadow-[0_0_24px_rgba(0,0,0,0.05)] transform-gpu overflow-hidden">
        <main
          className={`flex-1 overflow-y-auto no-scrollbar pt-safe px-safe ${hideBottomBar ? "pb-safe" : "pb-[100px]"}`}
        >
          <Outlet />
        </main>
        {!hideBottomBar && (
          <div className="relative w-full [&>div]:!absolute [&>div]:!bottom-0">
            <BottomBar />
          </div>
        )}
      </div>
    </div>
  );
};

export { MobileLayout };

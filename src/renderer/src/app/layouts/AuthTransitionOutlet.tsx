import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

const AUTH_ROUTE_ORDER = ["/welcome", "/login", "/signup", "/find-id", "/find-password"] as const;
const AUTH_TRANSITION_DURATION = 380;

const getAuthRouteIndex = (pathname: string) => {
  const index = AUTH_ROUTE_ORDER.findIndex(path => path === pathname);

  return index === -1 ? 0 : index;
};

const shouldReduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const AuthTransitionOutlet = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const container = containerRef.current;
    const previousPath = previousPathRef.current;
    previousPathRef.current = location.pathname;

    if (!container || previousPath === location.pathname || shouldReduceMotion()) {
      return;
    }

    const direction =
      getAuthRouteIndex(location.pathname) >= getAuthRouteIndex(previousPath) ? 1 : -1;
    const animation = container.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${direction * 28}px, 14px, 0) scale(0.985)`,
          filter: "blur(3px)",
        },
        {
          opacity: 1,
          transform: "translate3d(0, 0, 0) scale(1)",
          filter: "blur(0)",
        },
      ],
      {
        duration: AUTH_TRANSITION_DURATION,
        easing: "cubic-bezier(0.2, 0.9, 0.2, 1)",
      }
    );

    return () => animation.cancel();
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="h-full min-h-full will-change-transform">
      <Outlet />
    </div>
  );
};

export { AuthTransitionOutlet };

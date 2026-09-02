import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { setupRouterOutlet } from "@capgo/capacitor-transitions/react";

import { initCapgoTransitions } from "./initCapgoTransitions";

const AUTH_TRANSITION_DURATION = 380;

initCapgoTransitions();

const AuthTransitionOutlet = () => {
  const outletRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (outletRef.current) {
      setupRouterOutlet(outletRef.current, {
        platform: "auto",
        duration: AUTH_TRANSITION_DURATION,
        swipeGesture: "auto",
      });
    }
  }, []);

  return (
    <cap-router-outlet ref={outletRef} class="block h-full min-h-full">
      <Outlet />
    </cap-router-outlet>
  );
};

export { AuthTransitionOutlet };

import { useRef } from "react";
import { Outlet } from "react-router-dom";
import { usePageMotion } from "./usePageMotion";

export const AuthTransitionOutlet = () => {
  const outletRef = useRef<HTMLElement>(null);

  usePageMotion(outletRef, true);

  return (
    <cap-router-outlet ref={outletRef} class="block h-full min-h-full">
      <Outlet />
    </cap-router-outlet>
  );
};

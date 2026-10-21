import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { MaintenancePage } from "@/pages/maintenance";

import {
  isMaintenanceActive,
  MAINTENANCE_DISPLAY_START,
  MAINTENANCE_END,
  MAINTENANCE_SCHEDULE_LABEL,
  verifyMaintenanceCode,
} from "./maintenance";

interface MaintenanceGateProps {
  children: ReactNode;
}

const MaintenanceGate = ({ children }: MaintenanceGateProps) => {
  const [isActive, setIsActive] = useState(() => isMaintenanceActive(Date.now()));
  const [isUnlocked, setIsUnlocked] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleUnlock = async (code: string): Promise<boolean> => {
    if (!isNative) return false;

    const isValid = await verifyMaintenanceCode(code);
    if (isValid) setIsUnlocked(true);
    return isValid;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleTimeChange = () => {
      clearTimeout(timer);
      const now = Date.now();
      setIsActive(isMaintenanceActive(now));
      const nextBoundary =
        now < MAINTENANCE_DISPLAY_START ? MAINTENANCE_DISPLAY_START : MAINTENANCE_END;
      // 경계 시각에 바로 전환하고, 기기 시간 변경도 최대 1분 안에 반영한다.
      const delay = nextBoundary > now ? Math.min(60_000, nextBoundary - now) : 60_000;
      timer = setTimeout(handleTimeChange, delay);
    };
    handleTimeChange();
    window.addEventListener("focus", handleTimeChange);
    document.addEventListener("visibilitychange", handleTimeChange);
    const listener = isNative
      ? CapacitorApp.addListener("appStateChange", ({ isActive: isAppActive }) => {
          if (isAppActive) handleTimeChange();
        })
      : undefined;

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", handleTimeChange);
      document.removeEventListener("visibilitychange", handleTimeChange);
      void listener?.then(handle => handle.remove());
    };
  }, [isNative]);

  if (!isActive || isUnlocked) return children;

  return (
    <MaintenancePage
      allowUnlock={isNative}
      onUnlock={handleUnlock}
      scheduleLabel={MAINTENANCE_SCHEDULE_LABEL}
    />
  );
};

export default MaintenanceGate;

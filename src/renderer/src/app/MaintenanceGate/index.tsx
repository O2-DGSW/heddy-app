import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { MaintenancePage } from "@/pages/maintenance";
import { MobileLayout } from "../layouts/MobileLayout";

import {
  isMaintenanceActive,
  MAINTENANCE_START,
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
  const [isAccessEnded, setIsAccessEnded] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleUnlock = async (code: string): Promise<void> => {
    const isValid = await verifyMaintenanceCode(code);
    if (isValid) {
      setIsUnlocked(true);
      return;
    }

    // iOS는 exitApp을 지원하지 않고 브라우저는 탭 닫기를 거부할 수 있다.
    // 실제 종료 여부와 관계없이 재실행 전까지 앱 진입과 재입력을 막는다.
    setIsAccessEnded(true);
    try {
      if (Capacitor.getPlatform() === "android") {
        await CapacitorApp.exitApp();
      } else if (!isNative) {
        window.close();
      }
    } catch {
      // 종료 API가 실패해도 종료 안내 화면을 유지한다.
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleTimeChange = () => {
      clearTimeout(timer);
      const now = Date.now();
      setIsActive(isMaintenanceActive(now));
      const nextBoundary = now < MAINTENANCE_START ? MAINTENANCE_START : MAINTENANCE_END;
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

  if (!isAccessEnded && (!isActive || isUnlocked)) return children;

  return (
    <MobileLayout hideNavigation>
      <MaintenancePage
        isAccessEnded={isAccessEnded}
        onUnlock={handleUnlock}
        scheduleLabel={MAINTENANCE_SCHEDULE_LABEL}
      />
    </MobileLayout>
  );
};

export default MaintenanceGate;

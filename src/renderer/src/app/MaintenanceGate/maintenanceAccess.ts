import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

import { MAINTENANCE_END, MAINTENANCE_START } from "./maintenance";

const STORAGE_KEY = "heddy:maintenance-access";
// 다음 점검에서는 이전에 허용된 기기도 다시 확인하도록 일정별로 구분한다.
const ACCESS_VALUE = `${MAINTENANCE_START}:${MAINTENANCE_END}`;

export const restoreMaintenanceAccess = async (): Promise<boolean> => {
  if (Date.now() >= MAINTENANCE_END) return false;

  try {
    const value = Capacitor.isNativePlatform()
      ? (await SecureStoragePlugin.get({ key: STORAGE_KEY })).value
      : window.localStorage.getItem(STORAGE_KEY);
    return value === ACCESS_VALUE;
  } catch {
    // 첫 실행의 키 없음과 저장소 접근 실패는 허용되지 않은 상태로 처리한다.
    return false;
  }
};

export const rememberMaintenanceAccess = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    const { value } = await SecureStoragePlugin.set({ key: STORAGE_KEY, value: ACCESS_VALUE });
    if (!value) throw new Error("점검 진입 허용 상태를 저장하지 못했습니다.");
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, ACCESS_VALUE);
};

import { Capacitor, registerPlugin } from "@capacitor/core";

interface CameraPermissionPlugin {
  request: () => Promise<{ granted: boolean }>;
}

const CameraPermission = registerPlugin<CameraPermissionPlugin>("CameraPermission");

/**
 * iOS 앱은 WebView가 카메라를 열기 전에 시스템 권한을 먼저 받아 둔다(앱 시작 대신 AR 화면 진입 시점).
 * 거부돼도 여기서 막지 않는다. 이어지는 getUserMedia가 NotAllowedError로 실패해 안내 문구가 뜬다.
 */
export const requestNativeCameraPermission = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    await CameraPermission.request();
  } catch {
    // 이 플러그인이 없는 이전 앱 빌드에서는 WebView의 권한 요청에 맡긴다.
  }
};

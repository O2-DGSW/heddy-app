import { Capacitor } from "@capacitor/core";
import { useState } from "react";

import {
  APP_PERMISSION_NOTICE_STORAGE_KEY,
  CAMERA_CONSENT_STORAGE_KEY,
} from "./permissionNotice.constants";
import { readAcknowledged, writeAcknowledged } from "./permissionNoticeStorage";

/**
 * 앱을 처음 실행했을 때 접근권한을 한 번 안내한다.
 * 정보통신망법 제22조의2에 따른 고지라 앱(네이티브)에서만 띄우고, 웹은 브라우저가 권한을 묻는다.
 */
export const useAppPermissionNotice = () => {
  const [isOpen, setIsOpen] = useState(
    () => Capacitor.isNativePlatform() && !readAcknowledged(APP_PERMISSION_NOTICE_STORAGE_KEY)
  );

  const handleConfirm = () => {
    writeAcknowledged(APP_PERMISSION_NOTICE_STORAGE_KEY);
    setIsOpen(false);
  };

  return { isOpen, handleConfirm };
};

/**
 * 카메라를 켜기 전에 사용 목적을 알리고 동의를 받았는지.
 * 동의하기 전에는 시스템 권한 창을 띄우지 않는다. 한 번 동의하면 다음부터는 바로 카메라를 켠다.
 */
export const useCameraConsent = () => {
  const [hasCameraConsent, setHasCameraConsent] = useState(() =>
    readAcknowledged(CAMERA_CONSENT_STORAGE_KEY)
  );

  const handleCameraConsent = () => {
    writeAcknowledged(CAMERA_CONSENT_STORAGE_KEY);
    setHasCameraConsent(true);
  };

  return { hasCameraConsent, handleCameraConsent };
};

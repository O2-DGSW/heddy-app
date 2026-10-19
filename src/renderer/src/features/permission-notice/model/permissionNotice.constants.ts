/** 접근권한 고지에 보여 줄 항목. 권한을 새로 쓰게 되면 여기에 먼저 추가한다(AndroidManifest와 맞춘다) */
export interface PermissionNoticeItem {
  name: string;
  purpose: string;
}

/** 필수 접근권한. 앱 기능에 꼭 필요한 위험 권한은 없다(인터넷·진동은 동의가 필요 없는 일반 권한) */
export const REQUIRED_PERMISSIONS: PermissionNoticeItem[] = [];

/** 선택 접근권한. 허용하지 않아도 해당 기능 외의 서비스는 이용할 수 있다 */
export const OPTIONAL_PERMISSIONS: PermissionNoticeItem[] = [
  {
    name: "카메라",
    purpose: "AR 헤어스타일 체험에서 얼굴을 비춰 헤어스타일을 합성해 보여 줄 때 사용해요.",
  },
];

/** 안내 내용이 바뀌면 버전을 올려 다시 보여 준다 */
export const APP_PERMISSION_NOTICE_STORAGE_KEY = "heddy.permission-notice.v1";
export const CAMERA_CONSENT_STORAGE_KEY = "heddy.camera-consent.v1";

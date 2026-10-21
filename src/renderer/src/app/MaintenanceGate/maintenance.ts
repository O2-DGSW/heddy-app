export const MAINTENANCE_START = Date.parse("2026-10-22T00:00:00+09:00");
export const MAINTENANCE_END = Date.parse("2026-10-22T21:00:00+09:00");
export const MAINTENANCE_SCHEDULE_LABEL = "2026년 10월 22일 00:00 ~ 21:00 (KST)";

// TODO: 이번 점검 종료 후 사전 표시 구간을 제거한다. 개발 확인 요청으로 하루 먼저
// 차단하되, 무기한 강제 표시가 남지 않도록 정식 점검 종료 시각을 함께 적용한다.
const PREVIEW_START = Date.parse("2026-10-21T00:00:00+09:00");
export const MAINTENANCE_DISPLAY_START = Math.min(PREVIEW_START, MAINTENANCE_START);

export const isMaintenanceActive = (now: number): boolean =>
  now >= MAINTENANCE_DISPLAY_START && now < MAINTENANCE_END;

// 점검 화면의 임시 진입 코드만 검증한다. 클라이언트 해시는 서버 인증을 대체하지 않는다.
const ACCESS_CODE_DIGEST = "4b249a431acbe448101d76bfb7ba0b066ab93daad3dfbb03c93d90e817300ce3";

export const verifyMaintenanceCode = async (code: string): Promise<boolean> => {
  if (!/^\d{6}$/.test(code)) return false;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join(
    ""
  );
  return hex === ACCESS_CODE_DIGEST;
};

/**
 * 환경변수는 여기서만 읽고 검증한다. VITE_ 값은 번들에 그대로 들어가 사용자에게 공개되므로 비밀값을 넣지 않는다.
 */

const readUrl = (name: string, value: string | undefined): string | undefined => {
  const trimmed = value?.trim().replace(/\/$/, "");

  if (!trimmed) {
    return undefined;
  }

  try {
    new URL(trimmed);
  } catch {
    throw new Error(`${name} 값이 올바른 주소가 아닙니다: ${trimmed}`);
  }

  return trimmed;
};

const apiBaseUrl = readUrl("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL);

// 운영 빌드에서 API 주소가 없으면 요청이 앱 자신의 주소로 가서 모든 화면이 실패한다
if (import.meta.env.PROD && !apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL이 설정되지 않았습니다.");
}

export const env = {
  /** 앱 서버(REST) 주소. 개발 중에는 비어 있을 수 있다 */
  apiBaseUrl,
  /** AR 서버 주소. 비어 있으면 AR 기능을 쓸 수 없다 (형식 검증은 AR 쪽에서 한다) */
  arServerUrl: import.meta.env.VITE_AR_SERVER_URL?.trim().replace(/\/$/, "") ?? "",
  /** Vite base. 웹은 `/mobile/`, 네이티브·로컬은 `/` */
  baseUrl: import.meta.env.BASE_URL,
  isDev: import.meta.env.DEV,
} as const;

import { isRecord } from "../guards";

type DebugDetailType = Record<string, unknown>;

interface DebugLogger {
  info: (step: string, detail?: DebugDetailType) => void;
  error: (step: string, error: unknown, detail?: DebugDetailType) => void;
}

const MAX_CAUSE_DEPTH = 3;

/**
 * 오류를 로그에 남길 수 있는 평범한 객체로 바꾼다. name·message와 함께 HTTP status, axios code,
 * cause 체인을 담는다. 네이티브 콘솔(Xcode, Logcat)은 객체를 펼쳐 보여 주지 않아 문자열로 남긴다.
 */
export const describeError = (error: unknown, depth = 0): DebugDetailType | string => {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const described: DebugDetailType = { name: error.name, message: error.message };
  const errorRecord: unknown = error;

  if (isRecord(errorRecord)) {
    if (typeof errorRecord.status === "number") described.status = errorRecord.status;
    if (typeof errorRecord.code === "string") described.code = errorRecord.code;
  }

  if (error.cause !== undefined && depth < MAX_CAUSE_DEPTH) {
    described.cause = describeError(error.cause, depth + 1);
  }

  return described;
};

const stringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * 네이티브 앱에서 원인을 추적하기 위한 단계별 로그. 모든 줄이 `[태그]`로 시작해 Xcode·Logcat에서 걸러 볼 수 있다.
 * 비밀값(토큰, 비밀번호)이나 SDP 원문처럼 기기 정보가 담긴 값은 넘기지 않는다.
 */
export const createDebugLogger = (tag: string): DebugLogger => ({
  info: (step, detail) => {
    console.info(`[${tag}] ${step}${detail ? ` ${stringify(detail)}` : ""}`);
  },
  error: (step, error, detail) => {
    console.error(`[${tag}] ${step} ${stringify({ ...detail, error: describeError(error) })}`);
  },
});

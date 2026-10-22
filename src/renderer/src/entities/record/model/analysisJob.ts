import type { AnalysisJobApiData } from "./analysis.types";

/** 화면이 구분하는 작업 단계. 모르는 상태는 아직 끝나지 않은 것으로 보고 계속 확인한다 */
export type AnalysisJobPhaseType = "pending" | "succeeded" | "failed" | "unavailable" | "stale";

export const getAnalysisJobPhase = (
  job: AnalysisJobApiData | null | undefined
): AnalysisJobPhaseType => {
  if (!job) {
    return "pending";
  }

  if (job.status === "STALE") return "stale";

  // 결과 식별자가 있으면 상태 이름과 상관없이 결과를 가져올 수 있다
  if (job.analysis_id || job.status === "SUCCEEDED") {
    return "succeeded";
  }

  if (job.status === "FAILED") {
    return "failed";
  }

  if (job.status === "UNAVAILABLE") {
    return "unavailable";
  }

  return "pending";
};

/** 작업 상태 확인 간격(ms). 금방 끝나는 경우를 놓치지 않게 처음엔 촘촘히, 오래 걸리면 점점 늘린다 */
const FIRST_POLL_INTERVAL_MS = 1_000;
const MAX_POLL_INTERVAL_MS = 4_000;
const POLL_BACKOFF_RATE = 1.5;
/** 이만큼 확인해도 끝나지 않으면 멈추고 화면에서 다시 확인하게 한다(약 5분) */
export const MAX_ANALYSIS_JOB_POLL_COUNT = 80;

export const getAnalysisJobPollInterval = (pollCount: number): number | false => {
  if (pollCount >= MAX_ANALYSIS_JOB_POLL_COUNT) {
    return false;
  }

  return Math.min(
    Math.round(FIRST_POLL_INTERVAL_MS * POLL_BACKOFF_RATE ** pollCount),
    MAX_POLL_INTERVAL_MS
  );
};

/** 0~100 범위로 자른 진행률. 서버가 진행률을 주지 않으면 null */
export const getAnalysisJobProgress = (job: AnalysisJobApiData | null | undefined) => {
  const progress = job?.progress;

  return typeof progress === "number" && Number.isFinite(progress)
    ? Math.min(Math.max(Math.round(progress), 0), 100)
    : null;
};

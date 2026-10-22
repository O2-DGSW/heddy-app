import { describe, expect, test } from "vitest";

import {
  getAnalysisJobPhase,
  getAnalysisJobPollInterval,
  getAnalysisJobProgress,
  MAX_ANALYSIS_JOB_POLL_COUNT,
} from "./analysisJob";

import type { AnalysisJobApiData } from "./analysis.types";

const job = (patch: Partial<AnalysisJobApiData>): AnalysisJobApiData => ({
  job_id: "job-1",
  status: "RUNNING",
  created_at: "2026-10-16T00:00:00Z",
  updated_at: "2026-10-16T00:00:00Z",
  ...patch,
});

describe("analysisJob", () => {
  test("상태를 화면 단계로 나누고, 모르는 상태는 진행 중으로 본다", () => {
    expect(getAnalysisJobPhase(job({ status: "STALE", analysis_id: "old" }))).toBe("stale");
    expect(getAnalysisJobPhase(undefined)).toBe("pending");
    expect(getAnalysisJobPhase(job({ status: "QUEUED" }))).toBe("pending");
    expect(getAnalysisJobPhase(job({ status: "SOMETHING_NEW" }))).toBe("pending");
    expect(getAnalysisJobPhase(job({ status: "SUCCEEDED" }))).toBe("succeeded");
    expect(getAnalysisJobPhase(job({ status: "RUNNING", analysis_id: "a-1" }))).toBe("succeeded");
    expect(getAnalysisJobPhase(job({ status: "FAILED" }))).toBe("failed");
    expect(getAnalysisJobPhase(job({ status: "UNAVAILABLE" }))).toBe("unavailable");
  });

  test("확인 간격은 1초에서 시작해 늘고 4초를 넘지 않으며, 너무 오래면 멈춘다", () => {
    expect(getAnalysisJobPollInterval(0)).toBe(1000);
    expect(getAnalysisJobPollInterval(1)).toBe(1500);
    expect(getAnalysisJobPollInterval(10)).toBe(4000);
    expect(getAnalysisJobPollInterval(MAX_ANALYSIS_JOB_POLL_COUNT)).toBe(false);
  });

  test("진행률은 0~100 정수로 자르고, 없으면 null이다", () => {
    expect(getAnalysisJobProgress(job({ progress: 42.6 }))).toBe(43);
    expect(getAnalysisJobProgress(job({ progress: 130 }))).toBe(100);
    expect(getAnalysisJobProgress(job({ progress: null }))).toBeNull();
  });
});

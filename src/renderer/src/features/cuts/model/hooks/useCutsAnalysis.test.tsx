// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type { ReactNode } from "react";

const api = vi.hoisted(() => ({
  getLatestAnalysisApi: vi.fn(),
  getAnalysisApi: vi.fn(),
  getAnalysisJobApi: vi.fn(),
  postAnalysisApi: vi.fn(),
  postAnalysisJobRetryApi: vi.fn(),
  getTreatmentRecordApi: vi.fn(),
}));

vi.mock("@/entities/record/api/analysisApi", async importOriginal => ({
  ...(await importOriginal<object>()),
  getLatestAnalysisApi: api.getLatestAnalysisApi,
  getAnalysisApi: api.getAnalysisApi,
  getAnalysisJobApi: api.getAnalysisJobApi,
  postAnalysisApi: api.postAnalysisApi,
  postAnalysisJobRetryApi: api.postAnalysisJobRetryApi,
}));

vi.mock("@/entities/record/api/treatmentRecordApi", async importOriginal => ({
  ...(await importOriginal<object>()),
  getTreatmentRecordApi: api.getTreatmentRecordApi,
}));

import { useCutsAnalysis } from "./useCutsAnalysis";

const ANALYSIS = {
  analysis_id: "analysis-1",
  job_id: "job-1",
  photo_id: "photo-after",
  status: "SUCCEEDED",
  metrics: [],
  confidence: { score: 90, grade: "HIGH", higher_is_better: true },
  model_version: "v1",
  analyzed_at: "2026-10-16T00:00:00Z",
};

const RECORD = {
  record_id: "record-1",
  photos: [
    { photo_id: "photo-before", image_type: "BEFORE", sort_order: 0, display_url: "https://img/b" },
    { photo_id: "photo-after", image_type: "AFTER", sort_order: 1, display_url: "https://img/a" },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useCutsAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getTreatmentRecordApi.mockResolvedValue(RECORD);
  });

  test("결과가 있으면 바로 결과를 보여 주고 분석을 다시 요청하지 않는다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(ANALYSIS);

    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.view.status).toBe("result"));
    expect(api.postAnalysisApi).not.toHaveBeenCalled();
  });

  test("결과가 없으면 AFTER 사진으로 자동 요청하고, 작업이 끝나면 결과 단건을 받아 보여 준다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.postAnalysisApi.mockResolvedValue({
      job_id: "job-1",
      record_id: "record-1",
      photo_id: "photo-after",
      status: "QUEUED",
      created_at: "2026-10-16T00:00:00Z",
    });
    api.getAnalysisJobApi
      .mockResolvedValueOnce({
        job_id: "job-1",
        status: "RUNNING",
        progress: 40,
        created_at: "",
        updated_at: "",
      })
      .mockResolvedValue({
        job_id: "job-1",
        status: "SUCCEEDED",
        analysis_id: "analysis-1",
        created_at: "",
        updated_at: "",
      });
    api.getAnalysisApi.mockResolvedValue(ANALYSIS);

    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });

    await waitFor(() =>
      expect(api.postAnalysisApi).toHaveBeenCalledWith("record-1", { photo_id: "photo-after" })
    );
    await waitFor(() =>
      expect(result.current.view).toMatchObject({ status: "analyzing", progress: 40 })
    );
    await waitFor(() => expect(result.current.view.status).toBe("result"), { timeout: 3000 });
    expect(api.getAnalysisApi).toHaveBeenCalledWith("analysis-1");
    expect(api.postAnalysisApi).toHaveBeenCalledTimes(1);
    expect(result.current.photoUrl).toBe("https://img/a");
  });

  test("작업이 FAILED면 재시도 버튼으로 같은 작업을 다시 접수한다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.postAnalysisApi.mockResolvedValue({
      job_id: "job-1",
      record_id: "record-1",
      photo_id: "photo-after",
      status: "QUEUED",
      created_at: "",
    });
    api.getAnalysisJobApi.mockResolvedValue({
      job_id: "job-1",
      status: "FAILED",
      created_at: "",
      updated_at: "",
    });
    api.postAnalysisJobRetryApi.mockResolvedValue({
      job_id: "job-2",
      record_id: "record-1",
      photo_id: "photo-after",
      status: "QUEUED",
      created_at: "",
    });

    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.view.status).toBe("failed"));
    result.current.handleRetry();
    await waitFor(() => expect(api.postAnalysisJobRetryApi).toHaveBeenCalledWith("job-1"));
  });

  test("사진이 없으면 요청하지 않고 사진 추가를 안내한다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.getTreatmentRecordApi.mockResolvedValue({ record_id: "record-1", photos: [] });

    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.view.status).toBe("no-photo"));
    expect(api.postAnalysisApi).not.toHaveBeenCalled();
  });
});

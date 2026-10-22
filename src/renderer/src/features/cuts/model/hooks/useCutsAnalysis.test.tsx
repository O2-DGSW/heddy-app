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
import { recordQueryKeys } from "@/entities/record";

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

const createWrapper = (
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
) => {
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

  test("기록 조회 실패를 무한 로딩으로 숨기지 않는다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.getTreatmentRecordApi.mockRejectedValue(new Error("사진 목록 조회 실패"));
    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });
    await waitFor(() =>
      expect(result.current.view).toEqual({ status: "load-error", message: "사진 목록 조회 실패" })
    );
  });

  test.each(["UNAVAILABLE", "STALE"])("%s 작업은 진행 중으로 남지 않는다", async status => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.postAnalysisApi.mockResolvedValue({
      job_id: "job-1",
      record_id: "record-1",
      photo_id: "photo-after",
      status: "PENDING",
      created_at: "",
    });
    api.getAnalysisJobApi.mockResolvedValue({
      job_id: "job-1",
      status,
      failure: {
        code: "UNSUPPORTED_IMAGE_FORMAT",
        message: "JPEG 또는 PNG 이미지만 분석할 수 있습니다",
      },
    });
    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });
    await waitFor(() =>
      expect(result.current.view.status).toBe(status === "STALE" ? "failed" : "unavailable")
    );
    if (status === "UNAVAILABLE")
      expect(result.current.view).toMatchObject({
        message: "JPEG 또는 PNG 이미지만 분석할 수 있습니다",
      });
  });

  test("사진 교체 후 이전 분석 불가 작업 대신 새 사진을 분석한다", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.postAnalysisApi.mockImplementation(async (_recordId, body) => ({
      job_id: body.photo_id,
      record_id: "record-1",
      photo_id: body.photo_id,
      status: "PENDING",
      created_at: "",
    }));
    api.getAnalysisJobApi.mockResolvedValue({ job_id: "photo-after", status: "UNAVAILABLE" });
    const { result } = renderHook(() => useCutsAnalysis("record-1"), {
      wrapper: createWrapper(client),
    });
    await waitFor(() => expect(result.current.view.status).toBe("unavailable"));
    client.setQueryData(recordQueryKeys.detail("record-1"), {
      ...RECORD,
      photos: [{ photo_id: "new-photo", image_type: "AFTER", sort_order: 0 }],
    });
    await waitFor(() =>
      expect(api.postAnalysisApi).toHaveBeenCalledWith("record-1", { photo_id: "new-photo" })
    );
  });

  test("사진이 없으면 요청하지 않고 사진 추가를 안내한다", async () => {
    api.getLatestAnalysisApi.mockResolvedValue(null);
    api.getTreatmentRecordApi.mockResolvedValue({ record_id: "record-1", photos: [] });

    const { result } = renderHook(() => useCutsAnalysis("record-1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.view.status).toBe("no-photo"));
    expect(api.postAnalysisApi).not.toHaveBeenCalled();
  });
});

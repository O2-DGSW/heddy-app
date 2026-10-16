import { describe, expect, test } from "vitest";

import { mapAnalysisToResult, pickAnalysisPhoto, pickAnalysisPhotoUrl } from "./mapAnalysis";

import type { AnalysisApiData, TreatmentRecordPhotoApiData } from "@/entities/record";

const photo = (patch: Partial<TreatmentRecordPhotoApiData>): TreatmentRecordPhotoApiData => ({
  photo_id: "p",
  image_type: "OTHER",
  sort_order: 0,
  ...patch,
});

describe("mapAnalysis", () => {
  test("분석 대상은 AFTER 사진을 먼저 고르고, URL이 없어도 photo_id로 고른다", () => {
    const photos = [
      photo({ photo_id: "first", sort_order: 0 }),
      photo({ photo_id: "after", image_type: "AFTER", sort_order: 1 }),
    ];

    expect(pickAnalysisPhoto(photos)?.photo_id).toBe("after");
    expect(pickAnalysisPhoto([photo({ photo_id: "only", sort_order: 3 })])?.photo_id).toBe("only");
    expect(pickAnalysisPhoto([])).toBeUndefined();
  });

  test("화면에 띄울 사진은 URL이 있는 사진 중에서 고른다", () => {
    const photos = [
      photo({ photo_id: "after", image_type: "AFTER", sort_order: 0 }),
      photo({ photo_id: "shown", sort_order: 1, display_url: "https://img/shown.jpg" }),
    ];

    expect(pickAnalysisPhotoUrl(photos)).toBe("https://img/shown.jpg");
  });

  test("요약 문장은 summary_comment를 쓰고, 비어 있으면 신뢰도 등급 문구로 채운다", () => {
    const base: AnalysisApiData = {
      analysis_id: "a",
      job_id: "j",
      status: "SUCCEEDED",
      metrics: [{ type: "COLOR_UNIFORMITY", score: 81.4, grade: "HIGH", higher_is_better: true }],
      confidence: { score: 76.6, grade: "MEDIUM", higher_is_better: true },
      model_version: "v1",
      analyzed_at: "2026-10-16T00:00:00Z",
    };

    expect(mapAnalysisToResult({ ...base, summary_comment: "윤기가 고르게 돌아요" })).toMatchObject(
      {
        confidencePercent: 77,
        confidenceDescription: "윤기가 고르게 돌아요",
        indicators: [{ id: "COLOR_UNIFORMITY", score: 81, confidence: "상" }],
        isStale: false,
      }
    );
    expect(mapAnalysisToResult({ ...base, summary_comment: " " }).confidenceDescription).toBe(
      "사진 상태에 따라 결과가 달라질 수 있어요"
    );
  });
});

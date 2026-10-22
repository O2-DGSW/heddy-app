import { describe, expect, test } from "vitest";
import { mapRecommendationToBasisRows } from "./mapRecommendationBasis";

describe("photo recommendation basis", () => {
  test("shows applied length and shape comparisons", () => {
    expect(
      mapRecommendationToBasisRows({
        photo_analysis: {
          status: "ASSESSED",
          applied: true,
          observed_length: "SHORT",
          compared_style_count: 4,
        },
      })
    ).toContainEqual({ label: "사진 분석", value: "숏 반영 · 윤곽 4개 스타일 비교 반영" });
  });
  test("explains photo failures without claiming they were applied", () => {
    expect(
      mapRecommendationToBasisRows({ photo_analysis: { status: "UNCERTAIN", applied: false } })
    ).toContainEqual({
      label: "사진 분석",
      value: "길이 판별 어려움 · 얼굴과 머리 전체가 보이는 사진 필요",
    });
    expect(
      mapRecommendationToBasisRows({
        photo_analysis: { status: "NEWER_PROFILE", applied: false, compared_style_count: 2 },
      })
    ).toContainEqual({
      label: "사진 분석",
      value: "직접 수정한 머리 길이 우선 · 윤곽 2개 스타일 비교 반영",
    });
  });
});

import { afterEach, describe, expect, test, vi } from "vitest";

import { mapRecommendationToHomeCards } from "./mapRecommendationToHomeCards";
import { mapTreatmentRecordToRecentRecord } from "./mapTreatmentRecordToRecentRecord";

describe("mapRecommendationToHomeCards", () => {
  test("추천이 없으면 빈 배열이다", () => {
    expect(mapRecommendationToHomeCards(null)).toEqual([]);
    expect(mapRecommendationToHomeCards({ recommendation_run_id: "run", items: [] })).toEqual([]);
  });

  test("순위대로 정렬해 상위 3개만 카드로 만들고 일치도를 변환한다", () => {
    const cards = mapRecommendationToHomeCards({
      recommendation_run_id: "run",
      items: [
        { rank: 4, hairstyle: { hairstyle_id: "d", style_name: "D" } },
        { rank: 3, hairstyle: { hairstyle_id: "c", style_name: "C" } },
        {
          rank: 1,
          score: 0.82,
          hairstyle: {
            hairstyle_id: "a",
            style_name: "A",
            thumbnail_url: "https://example.test/a",
          },
          management_difficulty: "low",
          estimated_daily_care_minutes: 10,
        },
        { rank: 2, hairstyle: { hairstyle_id: "b", style_name: null } },
      ],
    });

    expect(cards).toEqual([
      {
        id: "a",
        rank: 1,
        title: "A",
        imageUrl: "https://example.test/a",
        colorName: "컬러 정보 없음",
        tags: ["관리 쉬움", "10분 케어"],
        matchRate: 82,
      },
      expect.objectContaining({ id: "b", rank: 2, title: "추천 스타일", imageUrl: "" }),
      expect.objectContaining({ id: "c", rank: 3, title: "C", imageUrl: "" }),
    ]);
  });
});

describe("mapTreatmentRecordToRecentRecord", () => {
  afterEach(() => vi.useRealTimers());

  test("시술 종류를 한글로 잇고 비어 있는 정보는 안내 문구로 채운다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T12:00:00"));
    const record = mapTreatmentRecordToRecentRecord({
      record_id: "r1",
      performed_at: "2026-03-05T12:00:00",
      service_types: ["CUT", "COLOR"],
      satisfaction: null,
      thumbnail_url: "https://example.test/thumb",
    });

    expect(record).toEqual({
      id: "r1",
      date: "2026-03-05",
      procedureName: "커트 · 염색",
      salonName: "미용실 정보 없음",
      designerName: "디자이너 정보 없음",
      rating: 0,
      thumbnailUrl: "https://example.test/thumb",
      daysAgo: "2일 전",
    });
  });
});

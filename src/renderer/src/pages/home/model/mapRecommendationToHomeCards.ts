import type { RecommendationApiData, RecommendationItemApiData } from "@/entities";

import type { RecommendationCardType } from "./types";

const MAX_HOME_RECOMMENDATION_COUNT = 2;

const formatDifficulty = (difficulty: string) => {
  const normalizedDifficulty = difficulty.toUpperCase();

  if (normalizedDifficulty === "LOW" || normalizedDifficulty === "EASY") {
    return "관리 쉬움";
  }

  if (normalizedDifficulty === "MEDIUM" || normalizedDifficulty === "NORMAL") {
    return "관리 보통";
  }

  if (normalizedDifficulty === "HIGH" || normalizedDifficulty === "HARD") {
    return "관리 어려움";
  }

  return difficulty;
};

const buildRecommendationTags = (item: RecommendationItemApiData) => {
  const tags: string[] = [];

  if (item.management_difficulty) {
    tags.push(formatDifficulty(item.management_difficulty));
  }

  if (typeof item.estimated_daily_care_minutes === "number") {
    tags.push(`${item.estimated_daily_care_minutes}분 케어`);
  }

  if (!tags.length && item.reasons?.[0]?.message) {
    tags.push("맞춤 추천");
  }

  return tags.slice(0, 2);
};

export const mapRecommendationToHomeCards = (
  recommendation: RecommendationApiData | null
): RecommendationCardType[] => {
  if (!recommendation?.items?.length) {
    return [];
  }

  return [...recommendation.items]
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, MAX_HOME_RECOMMENDATION_COUNT)
    .map((item, index) => ({
      id: item.hairstyle?.hairstyle_id ?? `recommend-${index}`,
      rank: index + 1,
      title: item.hairstyle?.style_name || "추천 스타일",
      imageUrl: item.hairstyle?.thumbnail_url ?? "",
      colorName: item.recommended_color ? "추천 컬러" : "컬러 정보 없음",
      tags: buildRecommendationTags(item),
    }));
};

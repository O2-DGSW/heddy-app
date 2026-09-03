import { createDateValue } from "@/entities/record/model/date";
import type {
  RecommendationApiData,
  RecommendationItemApiData,
} from "@/entities/recommendation/model/recommendation.types";
import type {
  RecommendationItem,
  RecommendReasonType,
  RecommendRiskLevel,
} from "@/features/recommend/model/types/Recommend.types";

/**
 * 관리 난이도 → 배지 문구.
 * 스펙에 값이 정의돼 있지 않아 예상되는 값만 매핑하고, 모르는 값은 null로 둬서 잘못된 배지를 띄우지 않는다.
 */
const RISK_LEVEL_BY_API_VALUE: Record<string, RecommendRiskLevel> = {
  LOW: "하",
  EASY: "하",
  MEDIUM: "중",
  NORMAL: "중",
  MODERATE: "중",
  HIGH: "상",
  HARD: "상",
};

/** 추천 방식(strategy) → 배지 문구. 위와 같은 이유로 아는 값만 매핑한다. */
const REASON_TYPE_BY_STRATEGY: Record<string, RecommendReasonType> = {
  HISTORY: "이력 기반",
  HISTORY_BASED: "이력 기반",
  TREATMENT_HISTORY: "이력 기반",
};

/** ISO 8601 시술일시를 화면에 쓸 YYYY-MM-DD로 바꾼다(기기 시간대 기준) */
const formatPerformedAt = (performedAt: string) => {
  const performedDate = new Date(performedAt);

  if (Number.isNaN(performedDate.getTime())) {
    return "";
  }

  return createDateValue(
    performedDate.getFullYear(),
    performedDate.getMonth() + 1,
    performedDate.getDate()
  );
};

/** 참고한 시술기록을 "2026-07-18 기록" 형태로 만든다. 서버가 시술 종류를 주지 않아 날짜만 쓴다. */
const buildReferenceRecordLabel = (item: RecommendationItemApiData) => {
  const performedAt = item.reference_records?.[0]?.performed_at;

  if (!performedAt) {
    return "";
  }

  const formattedDate = formatPerformedAt(performedAt);

  return formattedDate ? `${formattedDate} 기록` : "";
};

const mapRecommendationItem = (
  item: RecommendationItemApiData,
  strategy: string | null | undefined,
  index: number
): RecommendationItem => {
  const difficulty = item.management_difficulty?.toUpperCase();

  return {
    id: item.hairstyle?.hairstyle_id ?? `recommend-${index}`,
    thumbnailUrl: item.hairstyle?.thumbnail_url ?? "",
    styleName: item.hairstyle?.style_name ?? "",
    // 추천 방식·난이도는 값이 확정되지 않아 모르면 배지를 숨긴다.
    reasonType: strategy ? (REASON_TYPE_BY_STRATEGY[strategy.toUpperCase()] ?? null) : null,
    riskLevel: difficulty ? (RISK_LEVEL_BY_API_VALUE[difficulty] ?? null) : null,
    // 서버가 이유를 여러 개 줄 수 있어 전부 보여준다. 메시지가 없는 항목은 뺀다.
    reasonDescriptions: (item.reasons ?? [])
      .map(reason => reason.message)
      .filter((message): message is string => Boolean(message)),
    referenceRecordLabel: buildReferenceRecordLabel(item),
  };
};

/** 추천 응답을 화면에서 쓰는 카드 목록으로 바꾼다. rank 오름차순으로 정렬해 1순위부터 보여준다. */
export const mapRecommendationToItems = (
  recommendation: RecommendationApiData | null
): RecommendationItem[] => {
  if (!recommendation?.items?.length) {
    return [];
  }

  return [...recommendation.items]
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((item, index) => mapRecommendationItem(item, recommendation.strategy, index));
};

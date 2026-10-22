import type { RecommendationBasisApiData } from "@/entities/recommendation";
import type { RecommendationBasisRow } from "@/features/recommend/model/types/Recommend.types";

/** 모발 길이 → 화면 문구. 값은 모발 프로필(HairProfile)과 같은 enum이다 */
const HAIR_LENGTH_LABEL: Record<string, string> = {
  SHORT: "숏",
  BELOW_CHIN: "단발",
  BELOW_SHOULDER: "어깨 아래",
  BELOW_CHEST: "가슴 아래",
};

/** 모발 유형 → 화면 문구 */
const HAIR_TYPE_LABEL: Record<string, string> = {
  STRAIGHT: "직모",
  WAVY: "웨이브",
  CURLY: "곱슬",
};

/** 서버 enum을 화면 문구로 바꾼다. 모르는 값은 잘못된 문구를 띄우지 않도록 null로 둔다. */
const toLabel = (value: string | null | undefined, labels: Record<string, string>) => {
  if (!value) {
    return null;
  }

  return labels[value.toUpperCase()] ?? null;
};

/** 값이 없는 항목은 빼고 가운뎃점으로 잇는다. 남는 게 없으면 null이라 행 자체를 만들지 않는다. */
const joinValues = (values: (string | null)[]) => {
  const filledValues = values.filter((value): value is string => Boolean(value));

  return filledValues.length > 0 ? filledValues.join(" · ") : null;
};

/** "4건 · 최고 만족도 5점". 만족도를 안 주면 건수만 쓴다. */
const buildTreatmentHistoryValue = (basis: RecommendationBasisApiData) => {
  const { count, highest_satisfaction } = basis.treatment_history ?? {};

  if (typeof count !== "number") {
    return null;
  }

  return joinValues([
    `${count}건`,
    typeof highest_satisfaction === "number" ? `최고 만족도 ${highest_satisfaction}점` : null,
  ]);
};

/** "선호 4개 · 제외 2개" */
const buildStylePreferencesValue = (basis: RecommendationBasisApiData) => {
  const { preferred_count, excluded_count } = basis.style_preferences ?? {};

  return joinValues([
    typeof preferred_count === "number" ? `선호 ${preferred_count}개` : null,
    typeof excluded_count === "number" ? `제외 ${excluded_count}개` : null,
  ]);
};

/** "단발 · 웨이브". 길이와 유형만 쓰고, 모르는 값은 빼서 남은 것만 보여준다. */
const buildCurrentHairValue = (basis: RecommendationBasisApiData) => {
  const currentHair = basis.current_hair;

  if (!currentHair) {
    return null;
  }

  return joinValues([
    toLabel(currentHair.hair_length, HAIR_LENGTH_LABEL),
    toLabel(currentHair.hair_type, HAIR_TYPE_LABEL),
  ]);
};

const buildPhotoAnalysisValue = (basis: RecommendationBasisApiData): string | null => {
  const photo = basis.photo_analysis;
  if (!photo) return null;
  const compared = photo.compared_style_count ?? 0;
  const shape = compared > 0 ? `윤곽 ${compared}개 스타일 비교 반영` : null;
  if (photo.applied)
    return joinValues([
      `${toLabel(photo.observed_length, HAIR_LENGTH_LABEL) ?? "머리 길이"} 반영`,
      shape,
    ]);
  if (photo.status === "NEWER_PROFILE") return joinValues(["직접 수정한 머리 길이 우선", shape]);
  if (shape) return shape;
  const messages: Record<string, string> = {
    NO_RECENT_PHOTO: "최근 시술 후 사진이 없어 미반영",
    UNCERTAIN: "길이 판별 어려움 · 얼굴과 머리 전체가 보이는 사진 필요",
    UNREADABLE: "사진을 읽을 수 없음 · JPEG/PNG로 변경 필요",
    DISABLED: "사진 분석을 사용할 수 없어 미반영",
    UNAVAILABLE: "사진 분석 일시 실패 · 다시 추천받기 필요",
    ASSESSED: "사진 확인 완료 · 길이·윤곽은 미반영",
  };
  return messages[photo.status] ?? "사진 분석 미반영";
};

/**
 * 추천 응답의 recommendation_basis를 "추천 근거 데이터" 표의 행 목록으로 바꾼다.
 * 서버가 항목을 통째로 비워 보낼 수 있어, 값이 없는 행은 라벨만 남지 않도록 아예 뺀다.
 */
export const mapRecommendationToBasisRows = (
  basis: RecommendationBasisApiData | null | undefined
): RecommendationBasisRow[] => {
  if (!basis) {
    return [];
  }

  const arCandidateStyleCount = basis.ar_candidate_style_count;
  const availableCareTimeMinutes = basis.available_care_time_minutes;

  const rows: { label: string; value: string | null }[] = [
    { label: "시술 이력", value: buildTreatmentHistoryValue(basis) },
    {
      label: "AR 후보 스타일",
      value: typeof arCandidateStyleCount === "number" ? `${arCandidateStyleCount}건` : null,
    },
    { label: "선호 | 제외 태그", value: buildStylePreferencesValue(basis) },
    { label: "현재 머리", value: buildCurrentHairValue(basis) },
    { label: "사진 분석", value: buildPhotoAnalysisValue(basis) },
    {
      label: "관리 가능 시간",
      value:
        typeof availableCareTimeMinutes === "number"
          ? `하루 ${availableCareTimeMinutes}분 이하`
          : null,
    },
  ];

  return rows
    .filter((row): row is RecommendationBasisRow => row.value !== null)
    .map(row => ({ label: row.label, value: row.value }));
};

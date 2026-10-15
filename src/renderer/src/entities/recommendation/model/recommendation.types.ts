export type RecommendationHairstyleApiData = {
  hairstyle_id: string;
  style_name?: string | null;
  /** 조회할 때마다 새로 발급되는 짧은 만료 URL */
  thumbnail_url?: string | null;
  /** AR 체험 방식. 스펙에 값이 정의돼 있지 않다 */
  ar_mode?: string | null;
  asset_version?: string | null;
};

export type RecommendationReasonApiData = {
  code?: string | null;
  message?: string | null;
  params?: Record<string, string> | null;
};

export type RecommendationReferenceRecordApiData = {
  record_id: string;
  performed_at?: string | null;
  satisfaction?: number | null;
};

export type RecommendationItemApiData = {
  rank?: number | null;
  score?: number | null;
  hairstyle?: RecommendationHairstyleApiData | null;
  recommended_color?: string | null;
  /** 관리 난이도. 스펙에 값이 정의돼 있지 않다 */
  management_difficulty?: string | null;
  estimated_daily_care_minutes?: number | null;
  reasons?: RecommendationReasonApiData[] | null;
  reference_records?: RecommendationReferenceRecordApiData[] | null;
};

/** 추천 근거 데이터 - 시술 이력 요약 */
export type RecommendationTreatmentHistoryApiData = {
  count?: number | null;
  highest_satisfaction?: number | null;
};

/** 추천 근거 데이터 - 선호·제외 태그 개수 */
export type RecommendationStylePreferencesApiData = {
  preferred_count?: number | null;
  excluded_count?: number | null;
};

/** 추천 근거 데이터 - 현재 모발 상태. 값은 모발 프로필(HairProfile)과 같은 enum이다 */
export type RecommendationCurrentHairApiData = {
  /** STRAIGHT | WAVY | CURLY */
  hair_type?: string | null;
  /** HEALTHY | NORMAL | DAMAGED | SEVERELY_DAMAGED */
  hair_condition?: string | null;
  /** SHORT | BELOW_CHIN | BELOW_SHOULDER | BELOW_CHEST */
  hair_length?: string | null;
  /** THIN | NORMAL | THICK */
  hair_thickness?: string | null;
};

/** 추천을 어떤 데이터로 만들었는지 보여주는 요약 */
export type RecommendationBasisApiData = {
  treatment_history?: RecommendationTreatmentHistoryApiData | null;
  ar_candidate_style_count?: number | null;
  style_preferences?: RecommendationStylePreferencesApiData | null;
  current_hair?: RecommendationCurrentHairApiData | null;
  available_care_time_minutes?: number | null;
};

export type RecommendationApiData = {
  recommendation_run_id: string;
  /** 추천 방식. 스펙에 값이 정의돼 있지 않다 */
  strategy?: string | null;
  status?: string | null;
  generated_at?: string | null;
  /** 정상 추천이 아니라 대체 추천으로 채웠는지 여부 */
  fallback?: boolean | null;
  recommendation_basis?: RecommendationBasisApiData | null;
  items?: RecommendationItemApiData[] | null;
};

export type RecommendationApiResponse = {
  data: RecommendationApiData;
  request_id: string;
};

export type GenerateRecommendationRequest = {
  force_refresh?: boolean;
};

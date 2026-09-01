export type RecommendationHairstyleApiData = {
  hairstyle_id: string;
  style_name?: string | null;
  /** 조회할 때마다 새로 발급되는 짧은 만료 URL */
  thumbnail_url?: string | null;
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

export type RecommendationApiData = {
  recommendation_run_id: string;
  /** 추천 방식. 스펙에 값이 정의돼 있지 않다 */
  strategy?: string | null;
  status?: string | null;
  generated_at?: string | null;
  /** 정상 추천이 아니라 대체 추천으로 채웠는지 여부 */
  fallback?: boolean | null;
  items?: RecommendationItemApiData[] | null;
};

export type RecommendationApiResponse = {
  data: RecommendationApiData;
  request_id: string;
};

export type GenerateRecommendationRequest = {
  force_refresh?: boolean;
};

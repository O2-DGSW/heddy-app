export type RecommendReasonType = "이력 기반";

export type RecommendRiskLevel = "하" | "중" | "상";

export type RecommendationItem = {
  id: string;
  thumbnailUrl: string;
  styleName: string;
  /** 서버 strategy 값을 모르면 null이라 배지를 숨긴다 */
  reasonType: RecommendReasonType | null;
  /** 서버 관리 난이도 값을 모르면 null이라 배지를 숨긴다 */
  riskLevel: RecommendRiskLevel | null;
  reasonDescription: string;
  referenceRecordLabel: string;
};

export type RecommendationBasisRow = {
  label: string;
  value: string;
};

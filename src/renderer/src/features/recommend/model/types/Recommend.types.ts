export type RecommendReasonType = "이력 기반";

export type RecommendRiskLevel = "하" | "중" | "상";

export type RecommendationItem = {
  id: string;
  thumbnailUrl: string;
  styleName: string;
  reasonType: RecommendReasonType;
  riskLevel: RecommendRiskLevel;
  reasonDescription: string;
  referenceRecordLabel: string;
};

export type RecommendationBasisRow = {
  label: string;
  value: string;
};

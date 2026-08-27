import type { RecommendationBasisRow } from "@/features/recommend/model/types/Recommend.types";

// 백엔드 연동 전까지 화면 확인용으로 쓰는 더미 데이터
export const dummyRecommendationBasisRows: RecommendationBasisRow[] = [
  { label: "시술 이력", value: "4건 · 최고 만족도 5점" },
  { label: "AR 후보 스타일", value: "3건" },
  { label: "선호 | 제외 태그", value: "선호 4개 · 제외 2개" },
  { label: "현재 머리", value: "단발 · 레이어드" },
  { label: "관리 가능 시간", value: "하루 10분 이하" },
];

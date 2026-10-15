export type CutsCategory = "커트" | "펌" | "염색" | "클리닉";

export type CutsAnalysisStatus = "분석 완료" | "분석 중" | "재촬영";

export type CutsRecord = {
  id: string;
  date: string;
  procedureName: string;
  salonName: string;
  designerName: string;
  rating: number;
  thumbnailUrl: string;
  /** 카테고리 필터에 없는 시술 종류(탈색·스타일링·기타)면 null이라 "전체"에서만 보인다 */
  category: CutsCategory | null;
  /** 서버가 분석 상태를 아직 안 내려주면(분석 기능 연결 전) null이라 배지를 숨긴다 */
  analysisStatus: CutsAnalysisStatus | null;
  isSharing: boolean;
};

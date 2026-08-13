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
  category: CutsCategory;
  analysisStatus: CutsAnalysisStatus;
  isSharing: boolean;
};

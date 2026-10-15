export type CutsAnalysisConfidenceLevel = "상" | "중" | "하";

export type CutsAnalysisOverlay = {
  id: string;
  label: string;
  defaultActive: boolean;
  /** 사진 위에 겹쳐 그릴 이미지. 서버가 아직 URL을 주지 않으면 null이라 토글을 열 수 없다 */
  imageUrl: string | null;
};

export type CutsAnalysisIndicator = {
  id: string;
  label: string;
  score: number;
  confidence: CutsAnalysisConfidenceLevel;
  /** 높은 값이 좋은 지표인지. 거칠기처럼 낮을수록 좋은 지표가 있어 화면에서 구분해 보여준다 */
  higherIsBetter: boolean;
};

export type CutsAnalysisResult = {
  overlays: CutsAnalysisOverlay[];
  confidencePercent: number;
  confidenceDescription: string;
  indicators: CutsAnalysisIndicator[];
  /** 분석 뒤 사진이 바뀌어 결과가 현재 사진을 반영하지 않는 상태 */
  isStale: boolean;
};

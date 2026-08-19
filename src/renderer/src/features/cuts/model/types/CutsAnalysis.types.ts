export type CutsAnalysisConfidenceLevel = "상" | "중" | "하";

export type CutsAnalysisOverlay = {
  id: string;
  label: string;
  defaultActive: boolean;
};

export type CutsAnalysisIndicator = {
  id: string;
  label: string;
  score: number;
  confidence: CutsAnalysisConfidenceLevel;
};

export type CutsAnalysisResult = {
  recordId: string;
  photoUrl: string;
  overlays: CutsAnalysisOverlay[];
  confidencePercent: number;
  confidenceDescription: string;
  indicators: CutsAnalysisIndicator[];
};

import type { CutsAnalysisResult } from "@/features/cuts/model/types/CutsAnalysis.types";

// 백엔드 연동 전까지 화면 확인용으로 쓰는 더미 데이터
export const dummyAnalysisResults: CutsAnalysisResult[] = [
  {
    recordId: "record-1",
    photoUrl: "",
    overlays: [
      { id: "head-area", label: "머리 영역", defaultActive: true },
      { id: "color-diff", label: "색상 차이", defaultActive: true },
      { id: "side-volume", label: "좌우 볼륨", defaultActive: false },
    ],
    confidencePercent: 82,
    confidenceDescription: "사진 상태가 좋아 결과가 정확한 편이에요",
    indicators: [
      { id: "color-uniformity", label: "색 균일도", score: 78, confidence: "상" },
      { id: "volume-balance", label: "볼륨 균형", score: 64, confidence: "중" },
      { id: "shape-symmetry", label: "형태 대칭성", score: 71, confidence: "상" },
      { id: "roughness", label: "거칠기 징후", score: 41, confidence: "하" },
    ],
  },
  {
    recordId: "record-2",
    photoUrl: "",
    overlays: [
      { id: "head-area", label: "머리 영역", defaultActive: true },
      { id: "color-diff", label: "색상 차이", defaultActive: true },
      { id: "side-volume", label: "좌우 볼륨", defaultActive: false },
    ],
    confidencePercent: 68,
    confidenceDescription: "일부 각도가 어두워 결과가 다소 부정확할 수 있어요",
    indicators: [
      { id: "color-uniformity", label: "색 균일도", score: 55, confidence: "중" },
      { id: "volume-balance", label: "볼륨 균형", score: 60, confidence: "중" },
      { id: "shape-symmetry", label: "형태 대칭성", score: 49, confidence: "하" },
      { id: "roughness", label: "거칠기 징후", score: 33, confidence: "하" },
    ],
  },
];

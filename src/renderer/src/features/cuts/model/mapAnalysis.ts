import type {
  AnalysisApiData,
  AnalysisGrade,
  AnalysisMetricApiData,
  AnalysisMetricType,
  AnalysisOverlayApiData,
  AnalysisOverlayType,
  TreatmentRecordPhotoApiData,
} from "@/entities/record";
import type {
  CutsAnalysisConfidenceLevel,
  CutsAnalysisIndicator,
  CutsAnalysisOverlay,
  CutsAnalysisResult,
} from "@/features/cuts/model/types/CutsAnalysis.types";

const METRIC_LABEL: Record<AnalysisMetricType, string> = {
  COLOR_UNIFORMITY: "색 균일도",
  VOLUME_BALANCE: "볼륨 균형",
  SHAPE_SYMMETRY: "형태 대칭성",
  ROUGHNESS: "거칠기 징후",
};

const GRADE_LABEL: Record<AnalysisGrade, CutsAnalysisConfidenceLevel> = {
  HIGH: "상",
  MEDIUM: "중",
  LOW: "하",
};

const OVERLAY_LABEL: Record<AnalysisOverlayType, string> = {
  HAIR_MASK: "머리 영역",
  COLOR_DIFFERENCE: "색상 차이",
  VOLUME_GUIDE: "좌우 볼륨",
};

/** 처음부터 켜 두는 오버레이. 나머지는 사용자가 직접 켠다 */
const DEFAULT_ACTIVE_OVERLAY_TYPES: AnalysisOverlayType[] = ["HAIR_MASK", "COLOR_DIFFERENCE"];

/** summary가 비어 올 때 신뢰도 등급으로 대신 채우는 문구 */
const CONFIDENCE_DESCRIPTION: Record<AnalysisGrade, string> = {
  HIGH: "사진 상태가 좋아 결과가 정확한 편이에요",
  MEDIUM: "사진 상태에 따라 결과가 달라질 수 있어요",
  LOW: "사진이 흐리거나 어두워 결과가 부정확할 수 있어요",
};

/**
 * 지표 한 건을 화면용으로 바꾼다.
 * 모르는 지표 종류나 등급이 오면 이름을 지어내지 않고 그리지 않는다.
 */
const toIndicator = (metric: AnalysisMetricApiData): CutsAnalysisIndicator | null => {
  const label = metric.type ? METRIC_LABEL[metric.type] : undefined;
  const confidence = GRADE_LABEL[metric.grade];

  if (!metric.type || !label || !confidence) {
    return null;
  }

  return {
    id: metric.type,
    label,
    score: Math.round(metric.score),
    confidence,
    higherIsBetter: metric.higher_is_better,
  };
};

const toOverlay = (overlay: AnalysisOverlayApiData): CutsAnalysisOverlay | null => {
  const label = OVERLAY_LABEL[overlay.type];

  if (!label) {
    return null;
  }

  return {
    id: overlay.type,
    label,
    defaultActive: DEFAULT_ACTIVE_OVERLAY_TYPES.includes(overlay.type),
    // 서버는 file_id만 주고 이를 이미지 URL로 바꾸는 API가 아직 없다.
    // 백엔드가 URL을 내려주기 시작하면 이 한 줄만 그 값으로 바꾸면 된다.
    imageUrl: null,
  };
};

/** 분석 응답을 분석완료 화면이 쓰는 형태로 바꾼다 */
export const mapAnalysisToResult = (analysis: AnalysisApiData): CutsAnalysisResult => {
  const grade = analysis.confidence?.grade;

  return {
    overlays: (analysis.overlays ?? [])
      .map(toOverlay)
      .filter((overlay): overlay is CutsAnalysisOverlay => overlay !== null),
    confidencePercent: Math.round(analysis.confidence?.score ?? 0),
    confidenceDescription:
      analysis.summary?.trim() ||
      (grade && CONFIDENCE_DESCRIPTION[grade]) ||
      "사진을 바탕으로 계산한 참고용 지표예요",
    indicators: analysis.metrics
      .map(toIndicator)
      .filter((indicator): indicator is CutsAnalysisIndicator => indicator !== null),
    isStale: analysis.status === "STALE",
  };
};

/**
 * 분석 화면에 띄울 사진을 고른다.
 * 분석 대상은 시술 결과라 시술 후(AFTER) 사진을 먼저 쓰고, 없으면 남은 사진 중 첫 장을 쓴다.
 */
export const pickAnalysisPhotoUrl = (photos: TreatmentRecordPhotoApiData[] = []): string => {
  const usable = [...photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter(photo => Boolean(photo.photo_url));

  const afterPhoto = usable.find(photo => photo.image_type === "AFTER");

  return afterPhoto?.photo_url ?? usable[0]?.photo_url ?? "";
};

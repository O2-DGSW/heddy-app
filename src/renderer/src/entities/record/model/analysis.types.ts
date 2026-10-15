/** 분석 지표 종류. 전체 신뢰도(confidence)는 type이 비어 있다 */
export type AnalysisMetricType =
  "COLOR_UNIFORMITY" | "SHAPE_SYMMETRY" | "VOLUME_BALANCE" | "ROUGHNESS";

/** 신뢰도 등급 */
export type AnalysisGrade = "LOW" | "MEDIUM" | "HIGH";

/** 작업 상태. 사진이 바뀐 뒤면 STALE이며, 이때도 결과는 그대로 내려온다 */
export type AnalysisStatus = "SUCCEEDED" | "STALE";

export type AnalysisOverlayType = "HAIR_MASK" | "COLOR_DIFFERENCE" | "VOLUME_GUIDE";

export type AnalysisMetricApiData = {
  type?: AnalysisMetricType;
  /** 0~100, 소수점 둘째 자리까지 */
  score: number;
  grade: AnalysisGrade;
  /** 높은 값이 좋은 지표인지. 지표 이름으로 분기하면 지표가 늘 때마다 앱을 고쳐야 하므로 이 값을 쓴다 */
  higher_is_better: boolean;
};

export type AnalysisOverlayApiData = {
  type: AnalysisOverlayType;
  /** 오버레이 이미지 파일 식별자. 이 식별자를 이미지 URL로 바꾸는 API는 아직 없다 */
  file_id: string;
};

export type AnalysisApiData = {
  analysis_id: string;
  job_id: string;
  status: AnalysisStatus;
  /** 지표 4종. 화면의 상태 지표 목록이 이 배열을 그린다 */
  metrics: AnalysisMetricApiData[];
  /** 결과 전체 신뢰도 */
  confidence: AnalysisMetricApiData;
  /** 점수를 낸 모델 버전. 모델이 다르면 과거 결과와 점수를 견줄 수 없다 */
  model_version: string;
  /** 결과 요약 문장. 없을 수 있다 */
  summary?: string | null;
  analyzed_at: string;
  /** 분석 서버가 만들기 전에는 빈 배열이다 */
  overlays?: AnalysisOverlayApiData[];
};

export type AnalysisApiResponse = {
  data: AnalysisApiData;
  request_id: string;
};

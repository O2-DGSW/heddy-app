import { apiClient, getApiErrorMessage, getHttpStatus } from "@heddy/api";
import type {
  AnalysisApiData,
  AnalysisApiResponse,
  AnalysisJobAcceptedApiData,
  AnalysisJobAcceptedApiResponse,
  AnalysisJobApiData,
  AnalysisJobApiResponse,
  PostAnalysisRequest,
} from "@/entities/record/model/analysis.types";

/** 모델을 쓸 수 없을 때 서버는 임의 점수를 만들지 않고 503으로 답한다 */
const MODEL_UNAVAILABLE_MESSAGE = "지금은 AI 분석을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.";

/** 분석 서버 문제(503)인지. 사용자가 사진을 바꿔도 해결되지 않아 화면 안내를 다르게 한다 */
export const isAnalysisModelUnavailableError = (error: unknown) => {
  if (getHttpStatus(error) === 503) {
    return true;
  }

  return error instanceof Error && getHttpStatus(error.cause) === 503;
};

const toAnalysisError = (error: unknown, fallbackMessage: string) =>
  new Error(
    getHttpStatus(error) === 503
      ? MODEL_UNAVAILABLE_MESSAGE
      : getApiErrorMessage(error, fallbackMessage),
    { cause: error }
  );

/**
 * 최신 분석 결과 조회
 * - 기록의 가장 최근 분석 결과를 돌려준다.
 * - 분석한 적이 없으면 404다. 오류가 아니라 결과가 아직 없는 정상 상태라 null로 구분해 돌려준다.
 */
export const getLatestAnalysisApi = async (recordId: string): Promise<AnalysisApiData | null> => {
  try {
    const res = await apiClient.get<AnalysisApiResponse>(
      `/treatment-records/${recordId}/analyses/latest`
    );

    return res.data.data;
  } catch (error) {
    if (getHttpStatus(error) === 404) {
      return null;
    }

    throw toAnalysisError(error, "분석 결과를 불러오지 못했습니다.");
  }
};

/** 분석 결과 단건 조회. 작업이 끝나면 받은 analysis_id로 결과를 바로 가져온다 */
export const getAnalysisApi = async (analysisId: string): Promise<AnalysisApiData> => {
  try {
    const res = await apiClient.get<AnalysisApiResponse>(`/analyses/${analysisId}`);

    return res.data.data;
  } catch (error) {
    throw toAnalysisError(error, "분석 결과를 불러오지 못했습니다.");
  }
};

/** 머리 분석 요청. READY 상태의 시술 사진을 비동기로 분석하고, 접수되면 202로 작업을 돌려준다 */
export const postAnalysisApi = async (
  recordId: string,
  body: PostAnalysisRequest
): Promise<AnalysisJobAcceptedApiData> => {
  try {
    const res = await apiClient.post<AnalysisJobAcceptedApiResponse>(
      `/treatment-records/${recordId}/analyses`,
      body
    );

    return res.data.data;
  } catch (error) {
    throw toAnalysisError(error, "AI 분석을 요청하지 못했습니다.");
  }
};

/** 실패(FAILED)한 작업을 새 작업 ID로 다시 접수한다. UNAVAILABLE은 재촬영 대상이라 재시도하지 않는다 */
export const postAnalysisJobRetryApi = async (
  jobId: string
): Promise<AnalysisJobAcceptedApiData> => {
  try {
    const res = await apiClient.post<AnalysisJobAcceptedApiResponse>(
      `/analysis-jobs/${jobId}/retry`
    );

    return res.data.data;
  } catch (error) {
    throw toAnalysisError(error, "AI 분석을 다시 요청하지 못했습니다.");
  }
};

/** 분석 작업 상태 조회 */
export const getAnalysisJobApi = async (jobId: string): Promise<AnalysisJobApiData> => {
  try {
    const res = await apiClient.get<AnalysisJobApiResponse>(`/analysis-jobs/${jobId}`);

    return res.data.data;
  } catch (error) {
    throw toAnalysisError(error, "분석 진행 상태를 불러오지 못했습니다.");
  }
};

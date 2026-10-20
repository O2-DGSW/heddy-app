import { apiClient, getApiErrorMessage, getHttpStatus } from "@heddy/api";
import type {
  GenerateRecommendationRequest,
  RecommendationApiData,
  RecommendationApiResponse,
} from "@/entities/recommendation/model/recommendation.types";

/**
 * 최신 추천 조회
 * - 아직 추천을 만든 적이 없으면 서버가 404를 주므로, 에러 대신 null로 돌려준다.
 */
export const getLatestRecommendationApi = async (): Promise<RecommendationApiData | null> => {
  try {
    const res = await apiClient.get<RecommendationApiResponse>("/recommendations/latest");

    return res.data.data ?? null;
  } catch (error) {
    if (getHttpStatus(error) === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, "추천을 불러오지 못했습니다."), { cause: error });
  }
};

/**
 * 추천 생성
 * - 로그인 성공 직후 또는 사용자가 새 추천을 요청할 때 호출한다.
 */
export const generateRecommendationApi = async (
  body: GenerateRecommendationRequest = {}
): Promise<RecommendationApiData> => {
  try {
    const res = await apiClient.post<RecommendationApiResponse>("/recommendations/generate", body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "추천을 생성하지 못했습니다."), { cause: error });
  }
};

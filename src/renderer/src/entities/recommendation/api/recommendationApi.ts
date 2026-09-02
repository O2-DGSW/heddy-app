import { isAxiosError } from "axios";

import { api, getApiErrorMessage } from "@/shared/lib/api";
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
    const res = await api.get<RecommendationApiResponse>("/recommendations/latest");

    return res.data.data ?? null;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, "추천을 불러오지 못했습니다."), { cause: error });
  }
};

/**
 * 추천 생성
 * - 새 추천 결과를 만드는 요청이라 화면 진입만으로 부르지 않고 사용자가 눌렀을 때만 부른다.
 */
export const generateRecommendationApi = async (
  body: GenerateRecommendationRequest = {}
): Promise<RecommendationApiData> => {
  try {
    const res = await api.post<RecommendationApiResponse>("/recommendations/generate", body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "추천을 생성하지 못했습니다."), { cause: error });
  }
};

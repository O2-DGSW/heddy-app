import { isAxiosError } from "axios";

import { api, getApiErrorMessage } from "@/shared/lib/api";
import type { AnalysisApiData, AnalysisApiResponse } from "@/entities/record/model/analysis.types";

/**
 * 최신 분석 결과 조회
 * - 기록의 가장 최근 분석 결과를 돌려준다.
 * - 분석한 적이 없으면 404다. 오류가 아니라 결과가 아직 없는 정상 상태라 null로 구분해 돌려준다.
 */
export const getLatestAnalysisApi = async (recordId: string): Promise<AnalysisApiData | null> => {
  try {
    const res = await api.get<AnalysisApiResponse>(
      `/treatment-records/${recordId}/analyses/latest`
    );

    return res.data.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw new Error(getApiErrorMessage(error, "분석 결과를 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

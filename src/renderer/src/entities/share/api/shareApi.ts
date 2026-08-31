import { api, getApiErrorMessage } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type { GetSharesParams, PageResponseShareSummaryResponse } from "../model";

export const getSharesApi = async (
  params: GetSharesParams = {}
): Promise<PageResponseShareSummaryResponse> => {
  try {
    const res = await api.get<ApiResponse<PageResponseShareSummaryResponse>>("/shares", {
      params,
    });
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 목록 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const deleteShareApi = async (shareId: string): Promise<void> => {
  try {
    await api.delete(`/shares/${shareId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 철회에 실패했습니다."), {
      cause: error,
    });
  }
};

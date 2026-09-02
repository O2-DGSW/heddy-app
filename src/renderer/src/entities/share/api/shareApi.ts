import { api, getApiErrorMessage } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type {
  CreateShareRequest,
  GetSharesParams,
  PageResponseShareSummaryResponse,
  PublicShareResponse,
  ShareResponse,
} from "../model";

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

/**
 * 공유 링크 생성
 * - 응답의 share_url은 생성 시점에만 내려오므로, 화면에서 바로 쓰지 않으면 다시 얻을 수 없다.
 */
export const createShareApi = async (body: CreateShareRequest): Promise<ShareResponse> => {
  try {
    const res = await api.post<ApiResponse<ShareResponse>>("/shares", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 링크를 만들지 못했습니다."), {
      cause: error,
    });
  }
};

/**
 * 공개 공유 조회
 * - 링크를 받은 사람이 로그인 없이 보는 화면이라 인증이 필요 없다.
 * - 철회(SHARE_REVOKED)·만료(SHARE_EXPIRED)는 422로, 없는 토큰은 404로 구분해서 내려온다.
 */
export const getPublicShareApi = async (shareToken: string): Promise<PublicShareResponse> => {
  try {
    const res = await api.get<ApiResponse<PublicShareResponse>>(`/public/shares/${shareToken}`);
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유된 기록을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

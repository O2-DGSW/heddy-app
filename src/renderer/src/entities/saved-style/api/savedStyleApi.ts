import { api, getApiErrorMessage } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";
import type {
  SaveStyleRequest,
  SavedStyleResponse,
  SavedStylesResponse,
} from "@/entities/saved-style/model/savedStyle.types";

/**
 * 저장한 후보 스타일 목록 조회
 * - 최신 저장순으로 내려온다.
 * - image_url은 저장값이 아니라 조회 시점에 발급하는 짧은 만료의 Presigned URL이라 오래 들고 있으면 안 된다.
 */
export const getSavedStylesApi = async (): Promise<SavedStylesResponse> => {
  try {
    const res = await api.get<ApiResponse<SavedStylesResponse>>("/me/saved-styles");

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "저장한 후보 스타일을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

/** 후보 스타일 저장. 카탈로그에 있는 스타일과 색상만 저장할 수 있다 */
export const saveStyleApi = async (body: SaveStyleRequest): Promise<SavedStyleResponse> => {
  try {
    const res = await api.post<ApiResponse<SavedStyleResponse>>("/me/saved-styles", body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "후보 스타일을 저장하지 못했습니다."), {
      cause: error,
    });
  }
};

/**
 * 후보 스타일 삭제
 * - 이 후보를 실은 공유에서도 함께 빠진다. 공유 링크 자체는 살아 있다.
 */
export const deleteSavedStyleApi = async (savedStyleId: string): Promise<void> => {
  try {
    await api.delete(`/me/saved-styles/${savedStyleId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "후보 스타일을 삭제하지 못했습니다."), {
      cause: error,
    });
  }
};

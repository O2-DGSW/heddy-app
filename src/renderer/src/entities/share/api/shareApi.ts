import { api, getApiErrorMessage } from "@/shared/lib/api";
import type {
  CreateShareRequest,
  ShareApiResponse,
  ShareDetailResponse,
  ShareListApiData,
  ShareListParams,
  ShareResponse,
  UpdateShareRequest,
} from "@/entities/share/model/share.types";

/**
 * 공유 링크 생성
 * - 응답의 share_url은 생성 시점에만 내려오므로, 화면에서 바로 쓰지 않으면 다시 얻을 수 없다.
 */
export const createShareApi = async (body: CreateShareRequest): Promise<ShareResponse> => {
  try {
    const res = await api.post<ShareApiResponse<ShareResponse>>("/shares", body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 링크를 만들지 못했습니다."), { cause: error });
  }
};

/** 내 공유 목록 조회. 결과가 없으면 200과 빈 items가 온다 */
export const getSharesApi = async (params: ShareListParams = {}): Promise<ShareListApiData> => {
  try {
    const res = await api.get<ShareApiResponse<ShareListApiData>>("/shares", { params });

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 목록을 불러오지 못했습니다."), { cause: error });
  }
};

/** 공유 설정 상세 조회. 남의 공유는 없는 공유와 같은 404로 답한다 */
export const getShareApi = async (shareId: string): Promise<ShareDetailResponse> => {
  try {
    const res = await api.get<ShareApiResponse<ShareDetailResponse>>(`/shares/${shareId}`);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 설정을 불러오지 못했습니다."), { cause: error });
  }
};

/** 공유 수정. 전달한 항목만 바뀌며 공유 대상(기록·후보)은 수정 범위가 아니다 */
export const updateShareApi = async (
  shareId: string,
  body: UpdateShareRequest
): Promise<ShareDetailResponse> => {
  try {
    const res = await api.patch<ShareApiResponse<ShareDetailResponse>>(`/shares/${shareId}`, body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유 설정을 수정하지 못했습니다."), { cause: error });
  }
};

/** 공유 철회. 이미 철회된 공유에 다시 호출해도 성공(204)이다 */
export const revokeShareApi = async (shareId: string): Promise<void> => {
  try {
    await api.delete(`/shares/${shareId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "공유를 철회하지 못했습니다."), { cause: error });
  }
};

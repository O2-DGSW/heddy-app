import { api, getApiErrorMessage } from "@/shared/lib/api";
import type {
  TreatmentRecordDetailApiData,
  TreatmentRecordDetailApiResponse,
  TreatmentRecordListApiData,
  TreatmentRecordListApiResponse,
  TreatmentRecordListParams,
} from "@/entities/record/model/treatmentRecord.types";

export const getTreatmentRecordApi = async (
  recordId: string
): Promise<TreatmentRecordDetailApiData> => {
  try {
    const res = await api.get<TreatmentRecordDetailApiResponse>(`/treatment-records/${recordId}`);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

/**
 * 시술기록 목록 조회
 * - 로그인한 사용자 본인의 기록만 내려온다(Bearer 토큰 필요).
 * - 기록이 없으면 200과 빈 items를 반환한다.
 */
export const getTreatmentRecordsApi = async (
  params: TreatmentRecordListParams = {}
): Promise<TreatmentRecordListApiData> => {
  try {
    const res = await api.get<TreatmentRecordListApiResponse>("/treatment-records", { params });

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

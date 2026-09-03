import { api, getApiErrorMessage } from "@/shared/lib/api";
import type {
  AddTreatmentRecordPhotoRequest,
  CreateTreatmentRecordRequest,
  TreatmentRecordDetailApiData,
  TreatmentRecordDetailApiResponse,
  TreatmentRecordListApiData,
  TreatmentRecordListApiResponse,
  TreatmentRecordListParams,
  TreatmentRecordPhotoApiData,
  TreatmentRecordPhotoApiResponse,
  UpdateTreatmentRecordRequest,
} from "@/entities/record/model/treatmentRecord.types";

const createPhotoFormData = ({
  file,
  image_type = "OTHER",
  sort_order,
}: AddTreatmentRecordPhotoRequest) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("image_type", image_type);

  if (sort_order !== undefined) {
    formData.append("sort_order", String(sort_order));
  }

  return formData;
};

/**
 * 시술기록 생성
 * - 로그인한 사용자 본인의 기록으로 생성된다(Bearer 토큰 필요).
 */
export const createTreatmentRecordApi = async (
  body: CreateTreatmentRecordRequest
): Promise<TreatmentRecordDetailApiData> => {
  try {
    const res = await api.post<TreatmentRecordDetailApiResponse>("/treatment-records", body);

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록을 저장하지 못했습니다."), {
      cause: error,
    });
  }
};

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
 * 시술기록 사진 추가
 * - 선택한 사진 파일을 기록 생성/수정 후 별도 업로드한다.
 */
export const addTreatmentRecordPhotoApi = async (
  recordId: string,
  body: AddTreatmentRecordPhotoRequest
): Promise<TreatmentRecordPhotoApiData> => {
  try {
    const res = await api.post<TreatmentRecordPhotoApiResponse>(
      `/treatment-records/${recordId}/photos`,
      createPhotoFormData(body),
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록 사진을 저장하지 못했습니다."), {
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

/**
 * 시술기록 부분 수정
 * - 전달한 필드만 반영되므로, 바뀐 값만 담아 보내면 된다.
 */
export const updateTreatmentRecordApi = async (
  recordId: string,
  body: UpdateTreatmentRecordRequest
): Promise<TreatmentRecordDetailApiData> => {
  try {
    const res = await api.patch<TreatmentRecordDetailApiResponse>(
      `/treatment-records/${recordId}`,
      body
    );

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록을 수정하지 못했습니다."), {
      cause: error,
    });
  }
};

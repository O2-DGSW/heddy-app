import { api, getApiErrorMessage } from "@/shared/lib/api";
import type {
  AddTreatmentRecordPhotoRequest,
  CompleteUploadApiResponse,
  ConnectTreatmentRecordPhotoRequest,
  CreateTreatmentRecordRequest,
  PresignUploadApiResponse,
  PresignUploadRequest,
  TreatmentRecordDetailApiData,
  TreatmentRecordDetailApiResponse,
  TreatmentRecordListApiData,
  TreatmentRecordListApiResponse,
  TreatmentRecordListParams,
  TreatmentRecordPhotoApiData,
  TreatmentRecordPhotoApiResponse,
  UpdateTreatmentRecordRequest,
} from "@/entities/record/model/treatmentRecord.types";

const TREATMENT_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TREATMENT_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/heic"]);

const arrayBufferToHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");

const getFileSha256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return arrayBufferToHex(hashBuffer);
};

const assertUploadableTreatmentPhoto = (file: File) => {
  if (!ALLOWED_TREATMENT_PHOTO_TYPES.has(file.type)) {
    throw new Error("jpg, png, heic 사진만 업로드할 수 있습니다.");
  }

  if (file.size > TREATMENT_PHOTO_MAX_BYTES) {
    throw new Error("시술기록 사진은 10MB 이하만 업로드할 수 있습니다.");
  }
};

const createPresignUploadRequest = async (file: File): Promise<PresignUploadRequest> => ({
  purpose: "TREATMENT_PHOTO",
  content_type: file.type,
  file_name: file.name,
  file_size: file.size,
  sha256: await getFileSha256(file),
});

const presignUploadApi = async (file: File) => {
  const body = await createPresignUploadRequest(file);
  const res = await api.post<PresignUploadApiResponse>("/uploads/presign", body);

  return res.data.data;
};

const putFileToPresignedUrl = async (
  uploadUrl: string,
  file: File,
  requiredHeaders: Record<string, string>
) => {
  const response = await fetch(uploadUrl, {
    body: file,
    headers: requiredHeaders,
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("사진 파일 업로드에 실패했습니다.");
  }
};

const completeUploadApi = async (uploadId: string) => {
  const res = await api.post<CompleteUploadApiResponse>(`/uploads/${uploadId}/complete`);

  return res.data.data;
};

const uploadTreatmentPhotoFile = async (file: File) => {
  assertUploadableTreatmentPhoto(file);

  const presignedUpload = await presignUploadApi(file);

  await putFileToPresignedUrl(presignedUpload.upload_url, file, presignedUpload.required_headers);

  const completedUpload = await completeUploadApi(presignedUpload.upload_id);

  if (completedUpload.status !== "READY") {
    throw new Error("사진 업로드가 아직 완료되지 않았습니다.");
  }

  return completedUpload.file_id;
};

const connectTreatmentRecordPhotoApi = async (
  recordId: string,
  body: ConnectTreatmentRecordPhotoRequest
) => {
  const res = await api.post<TreatmentRecordPhotoApiResponse>(
    `/treatment-records/${recordId}/photos`,
    body
  );

  return res.data.data;
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
 * - Presigned URL로 S3에 파일을 올리고 READY file_id만 시술기록에 연결한다.
 */
export const addTreatmentRecordPhotoApi = async (
  recordId: string,
  body: AddTreatmentRecordPhotoRequest
): Promise<TreatmentRecordPhotoApiData> => {
  try {
    const fileId = await uploadTreatmentPhotoFile(body.file);

    return await connectTreatmentRecordPhotoApi(recordId, {
      file_id: fileId,
      image_type: body.image_type ?? "AFTER",
      sort_order: body.sort_order,
    });
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

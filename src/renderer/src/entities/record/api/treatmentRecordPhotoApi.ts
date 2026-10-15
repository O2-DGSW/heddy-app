import { apiClient, getApiErrorMessage } from "@heddy/api";
import type {
  AddTreatmentRecordPhotoRequest,
  CompleteUploadApiResponse,
  ConnectTreatmentRecordPhotoRequest,
  PresignUploadApiResponse,
  PresignUploadRequest,
  TreatmentRecordPhotoApiData,
  TreatmentRecordPhotoApiResponse,
  UpdateTreatmentRecordPhotoRequest,
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
  const res = await apiClient.post<PresignUploadApiResponse>("/uploads/presign", body);

  return res.data.data;
};

const createPresignedUploadHeaders = (file: File, requiredHeaders: Record<string, string>) => {
  const headers = new Headers();

  Object.entries(requiredHeaders).forEach(([name, value]) => {
    headers.set(name, value);
  });

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", file.type);
  }

  return headers;
};

const putFileToPresignedUrl = async (
  uploadUrl: string,
  file: File,
  requiredHeaders: Record<string, string>
) => {
  let response: Response;

  try {
    response = await fetch(uploadUrl, {
      body: file,
      headers: createPresignedUploadHeaders(file, requiredHeaders),
      method: "PUT",
      mode: "cors",
    });
  } catch (error) {
    throw new Error(
      error instanceof TypeError
        ? "사진 저장소 업로드가 CORS 정책에 막혔습니다. 서버의 S3 CORS 설정을 확인해 주세요."
        : "사진 파일 업로드에 실패했습니다.",
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new Error("사진 파일 업로드에 실패했습니다.");
  }
};

const completeUploadApi = async (uploadId: string) => {
  const res = await apiClient.post<CompleteUploadApiResponse>(`/uploads/${uploadId}/complete`);

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
  const res = await apiClient.post<TreatmentRecordPhotoApiResponse>(
    `/treatment-records/${recordId}/photos`,
    body
  );

  return res.data.data;
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
 * 시술기록 사진 수정
 * - file을 넘기면 새로 올린 뒤 그 file_id로 교체한다. 지웠다 다시 붙이지 않으므로 photo_id가 유지된다.
 * - 나머지는 전달한 값만 바뀐다.
 */
export const updateTreatmentRecordPhotoApi = async (
  recordId: string,
  photoId: string,
  body: UpdateTreatmentRecordPhotoRequest
): Promise<TreatmentRecordPhotoApiData> => {
  try {
    const fileId = body.file ? await uploadTreatmentPhotoFile(body.file) : undefined;

    const res = await apiClient.patch<TreatmentRecordPhotoApiResponse>(
      `/treatment-records/${recordId}/photos/${photoId}`,
      {
        ...(fileId ? { file_id: fileId } : {}),
        ...(body.image_type ? { image_type: body.image_type } : {}),
        ...(body.sort_order !== undefined ? { sort_order: body.sort_order } : {}),
      }
    );

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록 사진을 수정하지 못했습니다."), {
      cause: error,
    });
  }
};

/** 시술기록 사진 삭제 */
export const deleteTreatmentRecordPhotoApi = async (
  recordId: string,
  photoId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/treatment-records/${recordId}/photos/${photoId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "시술기록 사진을 삭제하지 못했습니다."), {
      cause: error,
    });
  }
};

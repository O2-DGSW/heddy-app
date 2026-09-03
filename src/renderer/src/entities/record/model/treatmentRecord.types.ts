/** 서버가 정의한 시술 종류 */
export type ServiceType = "CUT" | "PERM" | "COLOR" | "BLEACH" | "CLINIC" | "STYLING" | "OTHER";
export type TreatmentRecordPhotoImageType = "BEFORE" | "AFTER" | "OTHER";

export type TreatmentRecordSort = "performedAt,desc" | "performedAt,asc";

export type TreatmentRecordListParams = {
  service_type?: ServiceType;
  /** 담당 디자이너 이름과 정확히 일치 */
  designer_name?: string;
  /** 미용실 이름과 정확히 일치 */
  salon_name?: string;
  /** 시술일 조회 시작(포함), ISO 8601 */
  from?: string;
  /** 시술일 조회 종료(포함), ISO 8601 */
  to?: string;
  page?: number;
  size?: number;
  sort?: TreatmentRecordSort;
};

/**
 * 목록 응답 한 건
 * - 미용실·디자이너·만족도는 등록 시 선택 입력이라 값이 비어 올 수 있다.
 * - thumbnail_url은 사진이 없으면 null이고, 있으면 만료가 짧은 Presigned URL이다.
 * - analysis_status는 분석 기능 연결 전까지 null이다.
 */
export type TreatmentRecordSummaryApiData = {
  record_id: string;
  performed_at: string;
  salon_name?: string | null;
  designer_name?: string | null;
  service_types?: ServiceType[];
  satisfaction?: number | null;
  thumbnail_url?: string | null;
  photos?: TreatmentRecordPhotoApiData[];
  analysis_status?: string | null;
};

export type PageApiData = {
  number: number;
  size: number;
  total_elements: number;
  total_pages: number;
  has_next: boolean;
};

export type TreatmentRecordListApiData = {
  items: TreatmentRecordSummaryApiData[];
  page: PageApiData;
};

export type TreatmentRecordListApiResponse = {
  data: TreatmentRecordListApiData;
  request_id: string;
};

export type TreatmentRecordPhotoApiData = {
  photo_id: string;
  image_type: TreatmentRecordPhotoImageType;
  sort_order: number;
  /** 조회 시점에 발급되는 짧은 만료의 Presigned GET URL */
  display_url?: string | null;
  /** 이전 응답 호환용 */
  photo_url?: string | null;
};

export type TreatmentRecordPriceApiData = {
  amount: number;
  currency: string;
};

export type TreatmentRecordDetailApiData = {
  record_id: string;
  service_types: ServiceType[];
  salon_name?: string | null;
  designer_name?: string | null;
  performed_at: string;
  satisfaction?: number | null;
  price?: TreatmentRecordPriceApiData | null;
  appointment_id?: string | null;
  memo?: string | null;
  next_visit_cautions?: string | null;
  created_at: string;
  photos?: TreatmentRecordPhotoApiData[];
};

export type TreatmentRecordDetailApiResponse = {
  data: TreatmentRecordDetailApiData;
  request_id: string;
};

export type TreatmentRecordPhotoApiResponse = {
  data: TreatmentRecordPhotoApiData;
  request_id: string;
};

export type UploadPurpose = "TREATMENT_PHOTO" | "AR_CAPTURE";

export type PresignUploadRequest = {
  purpose: UploadPurpose;
  content_type: string;
  file_name: string;
  file_size: number;
  sha256: string;
};

export type PresignUploadApiData = {
  upload_id: string;
  file_id: string;
  upload_url: string;
  required_headers: Record<string, string>;
  expires_at: string;
};

export type PresignUploadApiResponse = {
  data: PresignUploadApiData;
  request_id: string;
};

export type CompleteUploadApiData = {
  file_id: string;
  status: "READY" | string;
};

export type CompleteUploadApiResponse = {
  data: CompleteUploadApiData;
  request_id: string;
};

/**
 * 시술기록 사진 추가 요청
 * - 파일은 Presigned URL로 S3에 직접 업로드한 뒤, READY file_id를 기록에 연결한다.
 * - 현재 폼 사진은 시술 결과 사진으로 쓰이므로 기본 image_type은 AFTER를 쓴다.
 */
export type AddTreatmentRecordPhotoRequest = {
  file: File;
  image_type?: TreatmentRecordPhotoImageType;
  sort_order?: number;
};

/**
 * 시술기록 사진 수정 요청
 * - 전달한 값만 바뀐다.
 * - file을 넣으면 파일을 새로 올려 교체한다. photo_id가 유지되므로 지웠다 다시 붙이는 것과 달리
 *   표시 순서와 이 사진을 참조하는 분석 결과가 끊기지 않는다.
 */
export type UpdateTreatmentRecordPhotoRequest = {
  file?: File;
  image_type?: TreatmentRecordPhotoImageType;
  sort_order?: number;
};

export type ConnectTreatmentRecordPhotoRequest = {
  file_id: string;
  image_type?: TreatmentRecordPhotoImageType;
  sort_order?: number;
};

/**
 * 시술기록 생성 요청
 * - service_types와 performed_at은 새 기록을 만들 때 필요한 기본 정보다.
 * - 선택 입력값은 비워 두면 null로 보내 서버에서 빈 값으로 저장한다.
 * - price_amount와 price_currency는 함께 넣거나 함께 빼야 한다.
 */
export type CreateTreatmentRecordRequest = {
  service_types: ServiceType[];
  performed_at: string;
  salon_name?: string | null;
  designer_name?: string | null;
  satisfaction?: number | null;
  price_amount?: number | null;
  price_currency?: string | null;
  appointment_id?: string | null;
  memo?: string | null;
  next_visit_cautions?: string | null;
};

/**
 * 시술기록 부분 수정 요청
 * - 전달한 필드만 수정되고, nullable 필드에 null을 보내면 값이 지워진다.
 * - price_amount와 price_currency는 함께 넣거나 함께 빼야 한다.
 */
export type UpdateTreatmentRecordRequest = {
  service_types?: ServiceType[];
  salon_name?: string | null;
  designer_name?: string | null;
  performed_at?: string;
  satisfaction?: number | null;
  price_amount?: number | null;
  price_currency?: string | null;
  appointment_id?: string | null;
  memo?: string | null;
  next_visit_cautions?: string | null;
};

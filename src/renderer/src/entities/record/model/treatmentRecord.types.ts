/** 서버가 정의한 시술 종류 */
export type ServiceType = "CUT" | "PERM" | "COLOR" | "BLEACH" | "CLINIC" | "STYLING" | "OTHER";

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
  image_type: "BEFORE" | "AFTER" | "OTHER";
  sort_order: number;
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

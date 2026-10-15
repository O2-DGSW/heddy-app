export type ShareStatusType = "ACTIVE" | "REVOKED";

export type ShareFieldType =
  "PHOTOS" | "TREATMENT_DETAILS" | "SATISFACTION" | "CAUTIONS" | "MEMO" | "SAVED_STYLES";

export interface ShareSummaryResponse {
  share_id: string;
  status: ShareStatusType;
  fields: ShareFieldType[];
  expires_at: string;
  created_at: string;
}

export interface ShareDetailResponse extends ShareSummaryResponse {
  record_ids: string[];
  saved_style_ids: string[];
  revoked_at?: string | null;
}

export interface PageResponse {
  number: number;
  size: number;
  total_elements: number;
  total_pages: number;
  has_next: boolean;
}

export interface PageResponseShareSummaryResponse {
  items: ShareSummaryResponse[];
  page: PageResponse;
}

export interface GetSharesParams {
  status?: ShareStatusType;
  page?: number;
  size?: number;
}

export interface CreateShareRequest {
  /** 공유할 시술기록. 후보 스타일과 합쳐 1개 이상이어야 한다 */
  record_ids?: string[];
  saved_style_ids?: string[];
  /** 노출 항목. 1개 이상이어야 한다 */
  fields: ShareFieldType[];
  /** 유효기간(일). 비우면 서버가 7일로 잡는다 */
  expires_in_days?: number;
}

/** 생성 응답. share_url은 토큰 원문을 포함해 이때 딱 한 번만 내려온다 */
export interface ShareResponse extends ShareSummaryResponse {
  share_url: string;
}

/** 공개 공유 조회 응답. 공유에서 선택하지 않은 항목은 키 자체가 내려오지 않는다 */
export interface PublicSharePhoto {
  image_type?: string | null;
  display_url?: string | null;
}

export interface PublicShareRecord {
  performed_at?: string | null;
  salon_name?: string | null;
  designer_name?: string | null;
  service_types?: string[];
  satisfaction?: number | null;
  memo?: string | null;
  next_visit_cautions?: string | null;
  photos?: PublicSharePhoto[];
}

export interface PublicShareSavedStyle {
  style_name?: string | null;
  image_url?: string | null;
  reason?: string | null;
}

export interface PublicShareResponse {
  share: {
    expires_at?: string | null;
    /** 공유한 사람의 표시 이름. 사용자 식별자는 내려오지 않는다 */
    owner_display_name?: string | null;
  };
  records?: PublicShareRecord[];
  saved_styles?: PublicShareSavedStyle[];
}

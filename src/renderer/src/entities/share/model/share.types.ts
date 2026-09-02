/** 공유에서 노출할 항목 6종 */
export type ShareField =
  "PHOTOS" | "TREATMENT_DETAILS" | "SATISFACTION" | "CAUTIONS" | "MEMO" | "SAVED_STYLES";

export type ShareStatus = "ACTIVE" | "REVOKED";

export type ShareApiResponse<TData> = {
  data: TData;
  request_id: string;
};

export type SharePageApiData = {
  number: number;
  size: number;
  total_elements: number;
  total_pages: number;
  has_next: boolean;
};

export type CreateShareRequest = {
  /** 공유할 시술기록. 후보 스타일과 합쳐 1개 이상이어야 한다 */
  record_ids?: string[];
  saved_style_ids?: string[];
  /** 노출 항목. 1개 이상이어야 한다 */
  fields: ShareField[];
  /** 유효기간(일). 비우면 서버가 7일로 잡는다 */
  expires_in_days?: number;
};

/** 생성 응답. share_url은 토큰 원문을 포함해 이때 딱 한 번만 내려온다 */
export type ShareResponse = {
  share_id: string;
  share_url: string;
  status: ShareStatus;
  fields: ShareField[];
  expires_at: string;
  created_at: string;
};

export type ShareSummaryResponse = {
  share_id: string;
  status: ShareStatus;
  fields: ShareField[];
  expires_at: string;
  created_at: string;
};

export type ShareDetailResponse = {
  share_id: string;
  status: ShareStatus;
  fields: ShareField[];
  record_ids: string[];
  saved_style_ids: string[];
  expires_at: string;
  /** 철회하지 않았으면 비어 있다 */
  revoked_at?: string | null;
  created_at: string;
};

export type ShareListApiData = {
  items: ShareSummaryResponse[];
  page: SharePageApiData;
};

export type ShareListParams = {
  /** 생략하면 전체 */
  status?: ShareStatus;
  page?: number;
  /** 1~100 */
  size?: number;
};

export type UpdateShareRequest = {
  /** 교체할 노출 항목. 1개 이상이어야 한다 */
  fields?: ShareField[];
  /** 교체할 만료 시각. 현재보다 미래여야 한다 */
  expires_at?: string;
};

/** 공개 공유 조회 응답. 공유에서 선택하지 않은 항목은 키 자체가 내려오지 않는다 */
export type PublicSharePhoto = {
  image_type?: string | null;
  display_url?: string | null;
};

export type PublicShareRecord = {
  performed_at?: string | null;
  salon_name?: string | null;
  designer_name?: string | null;
  service_types?: string[];
  satisfaction?: number | null;
  memo?: string | null;
  next_visit_cautions?: string | null;
  photos?: PublicSharePhoto[];
};

export type PublicShareSavedStyle = {
  style_name?: string | null;
  image_url?: string | null;
  reason?: string | null;
};

export type PublicShareResponse = {
  share: {
    expires_at?: string | null;
    /** 공유한 사람의 표시 이름. 사용자 식별자는 내려오지 않는다 */
    owner_display_name?: string | null;
  };
  records?: PublicShareRecord[];
  saved_styles?: PublicShareSavedStyle[];
};

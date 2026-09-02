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

export type StyleTagCategoryType = "BANG" | "SHORT" | "BOB" | "MEDIUM" | "LONG" | "UPDO";

export interface StyleTagResponse {
  style_tag_id: string;
  tag_name: string;
  category: StyleTagCategoryType;
}

export interface StyleTagsResponse {
  items: StyleTagResponse[];
}

export interface StylePreferencesRequest {
  preferred_tag_ids: string[];
  excluded_tag_ids: string[];
}

export type StylePreferencesResponse = StylePreferencesRequest;

export interface StyleApiResponse<TData> {
  data: TData;
  request_id: string;
}

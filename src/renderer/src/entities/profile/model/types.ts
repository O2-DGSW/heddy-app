import type { ApiResponse } from "@/shared/lib/api";

export interface GetMyProfileResponse {
  user_id?: string | null;
  email?: string | null;
  nickname?: string | null;
  phone?: string | null;
  preferred_designer?: string | null;
  hair_cautions?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type GetMyProfileApiResponse = ApiResponse<GetMyProfileResponse | null>;

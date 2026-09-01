import type { ApiResponse } from "@/shared/lib/api";

export interface GetMyProfileResponse {
  user_id: string;
  email: string;
  nickname: string;
  phone: string;
  preferred_designer: string | null;
  hair_cautions: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type GetMyProfileApiResponse = ApiResponse<GetMyProfileResponse>;

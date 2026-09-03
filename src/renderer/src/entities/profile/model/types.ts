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

export interface UpdateMyProfileRequest {
  nickname: string;
  phone?: string;
}

export type UpdateMyProfileApiResponse = ApiResponse<GetMyProfileResponse | null>;

export interface DeleteMyAccountRequest {
  reauthentication_token: string;
  reason?: string;
}

export interface DeleteMyAccountResponse {
  deletion_request_id: string;
  requested_at: string;
  status: "COMPLETED" | "FAILED" | "PROCESSING" | "REQUESTED";
}

export type DeleteMyAccountApiResponse = ApiResponse<DeleteMyAccountResponse>;

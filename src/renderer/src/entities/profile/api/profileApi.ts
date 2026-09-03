import { isAxiosError } from "axios";

import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type {
  DeleteMyAccountApiResponse,
  DeleteMyAccountRequest,
  DeleteMyAccountResponse,
  GetMyProfileApiResponse,
  GetMyProfileResponse,
  UpdateMyProfileApiResponse,
  UpdateMyProfileRequest,
} from "../model";

const getProfileApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data.error?.message || error.response?.data.message || fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
};

export const getMyProfileApi = async (
  accessToken: string
): Promise<GetMyProfileResponse | null> => {
  try {
    const response = await api.get<GetMyProfileApiResponse>("/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data.data ?? null;
  } catch (error) {
    throw new Error(getProfileApiErrorMessage(error, "프로필을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

export const patchMyProfileApi = async (
  body: UpdateMyProfileRequest
): Promise<GetMyProfileResponse | null> => {
  try {
    const response = await api.patch<UpdateMyProfileApiResponse>("/me", body);

    return response.data.data ?? null;
  } catch (error) {
    throw new Error(getProfileApiErrorMessage(error, "회원정보를 저장하지 못했습니다."), {
      cause: error,
    });
  }
};

export const deleteMyAccountApi = async (
  body: DeleteMyAccountRequest
): Promise<DeleteMyAccountResponse> => {
  try {
    const response = await api.delete<DeleteMyAccountApiResponse>("/me", { data: body });

    return response.data.data;
  } catch (error) {
    throw new Error(getProfileApiErrorMessage(error, "회원 탈퇴를 요청하지 못했습니다."), {
      cause: error,
    });
  }
};

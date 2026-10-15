import { apiClient, getApiErrorMessage } from "@heddy/api";

import type {
  DeleteMyAccountApiResponse,
  DeleteMyAccountRequest,
  DeleteMyAccountResponse,
  GetMyProfileApiResponse,
  GetMyProfileResponse,
  UpdateMyProfileApiResponse,
  UpdateMyProfileRequest,
} from "../model";

export const getMyProfileApi = async (): Promise<GetMyProfileResponse | null> => {
  try {
    const response = await apiClient.get<GetMyProfileApiResponse>("/me");

    return response.data.data ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "프로필을 불러오지 못했습니다."), {
      cause: error,
    });
  }
};

export const patchMyProfileApi = async (
  body: UpdateMyProfileRequest
): Promise<GetMyProfileResponse | null> => {
  try {
    const response = await apiClient.patch<UpdateMyProfileApiResponse>("/me", body);

    return response.data.data ?? null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "회원정보를 저장하지 못했습니다."), {
      cause: error,
    });
  }
};

export const deleteMyAccountApi = async (
  body: DeleteMyAccountRequest
): Promise<DeleteMyAccountResponse> => {
  try {
    const response = await apiClient.delete<DeleteMyAccountApiResponse>("/me", { data: body });

    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "회원 탈퇴를 요청하지 못했습니다."), {
      cause: error,
    });
  }
};

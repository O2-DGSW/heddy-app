import { isAxiosError } from "axios";

import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type { GetMyProfileApiResponse, GetMyProfileResponse } from "../model";

const getProfileApiErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return (
      error.response?.data.error?.message ||
      error.response?.data.message ||
      "프로필을 불러오지 못했습니다."
    );
  }

  return error instanceof Error ? error.message : "프로필을 불러오지 못했습니다.";
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
    throw new Error(getProfileApiErrorMessage(error), { cause: error });
  }
};

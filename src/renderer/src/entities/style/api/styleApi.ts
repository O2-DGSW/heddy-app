import { isAxiosError } from "axios";

import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type {
  StyleApiResponse,
  StylePreferencesRequest,
  StylePreferencesResponse,
  StyleTagsResponse,
} from "../model";

const getStyleApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data.error?.message || error.response?.data.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export const getStyleTagsApi = async (): Promise<StyleTagsResponse> => {
  try {
    const res = await api.get<StyleApiResponse<StyleTagsResponse>>("/style-tags");
    return res.data.data;
  } catch (error) {
    throw new Error(getStyleApiErrorMessage(error, "스타일 태그 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const getStylePreferencesApi = async (): Promise<StylePreferencesResponse> => {
  try {
    const res = await api.get<StyleApiResponse<StylePreferencesResponse>>("/me/style-preferences");
    return res.data.data;
  } catch (error) {
    throw new Error(getStyleApiErrorMessage(error, "선호 스타일 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const putStylePreferencesApi = async (
  body: StylePreferencesRequest
): Promise<StylePreferencesResponse> => {
  try {
    const res = await api.put<StyleApiResponse<StylePreferencesResponse>>(
      "/me/style-preferences",
      body
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getStyleApiErrorMessage(error, "선호 스타일 저장에 실패했습니다."), {
      cause: error,
    });
  }
};

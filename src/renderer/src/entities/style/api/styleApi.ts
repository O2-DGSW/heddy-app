import { apiClient, getApiErrorMessage } from "@heddy/api";

import type {
  StyleApiResponse,
  StylePreferencesRequest,
  StylePreferencesResponse,
  StyleTagsResponse,
} from "../model";

export const getStyleTagsApi = async (): Promise<StyleTagsResponse> => {
  try {
    const res = await apiClient.get<StyleApiResponse<StyleTagsResponse>>("/style-tags");
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "스타일 태그 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const getStylePreferencesApi = async (): Promise<StylePreferencesResponse> => {
  try {
    const res =
      await apiClient.get<StyleApiResponse<StylePreferencesResponse>>("/me/style-preferences");
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "선호 스타일 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const putStylePreferencesApi = async (
  body: StylePreferencesRequest
): Promise<StylePreferencesResponse> => {
  try {
    const res = await apiClient.put<StyleApiResponse<StylePreferencesResponse>>(
      "/me/style-preferences",
      body
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "선호 스타일 저장에 실패했습니다."), {
      cause: error,
    });
  }
};

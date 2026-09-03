import { api, getApiErrorMessage } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";

import type {
  ChangeConsentRequest,
  ConsentStatusResponse,
  ConsentType,
  ConsentsResponse,
} from "../model";

export const getConsentsApi = async (): Promise<ConsentsResponse> => {
  try {
    const res = await api.get<ApiResponse<ConsentsResponse>>("/me/consents");
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "동의 상태 조회에 실패했습니다."), {
      cause: error,
    });
  }
};

export const putConsentApi = async (
  consentType: ConsentType,
  body: ChangeConsentRequest
): Promise<ConsentStatusResponse> => {
  try {
    const res = await api.put<ApiResponse<ConsentStatusResponse>>(
      `/me/consents/${consentType}`,
      body
    );
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "동의 상태 저장에 실패했습니다."), {
      cause: error,
    });
  }
};

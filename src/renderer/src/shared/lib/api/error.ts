import { isAxiosError } from "axios";

import type { ApiResponse } from "./type.ts";

/** 서버가 내려준 에러 메시지를 우선 쓰고, 없으면 기본 문구로 대체한다 */
export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.error?.message || error.response?.data?.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

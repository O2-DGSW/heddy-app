/** 검증 실패(VALIDATION_FAILED) 때 어느 필드가 왜 틀렸는지 */
export type ApiFieldError = {
  field: string;
  reason: string;
};

export type ApiError = {
  code?: string;
  message?: string;
  field_errors?: ApiFieldError[];
} | null;

/** 앱 서버 공통 응답 형태 */
export interface ApiResponse<TData = unknown> {
  success?: boolean;
  message?: string;
  data: TData;
  error?: ApiError;
  request_id?: string;
}

export interface ApiErrorResponse<TError = unknown> {
  message: string;
  errors?: TError;
  statusCode?: number;
}

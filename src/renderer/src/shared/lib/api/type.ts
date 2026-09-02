export type ApiError = {
  code?: string;
  message?: string;
} | null;

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

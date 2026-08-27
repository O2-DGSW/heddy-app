import { isAxiosError } from "axios";

import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";
import type {
  AuthApiResponse,
  AuthTokensApiData,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  SignupRequest,
  SocialSignupApiResponse,
  SocialSignupRequest,
  SocialSignupResponse,
  SmsSendRequest,
  SmsVerifyRequest,
} from "@/entities";

const getAuthApiData = <TData>(response: ApiResponse<TData>, fallbackMessage: string): TData => {
  if (!response.success) {
    throw new Error(response.error?.message || response.message || fallbackMessage);
  }

  return response.data;
};

const getAuthApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data.error?.message || error.response?.data.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const requestAuthData = async <TData>(
  request: Promise<{ data: ApiResponse<TData> }>,
  fallbackMessage: string
): Promise<TData> => {
  try {
    const res = await request;
    return getAuthApiData(res.data, fallbackMessage);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, fallbackMessage), { cause: error });
  }
};

const mapAuthTokens = (tokens: AuthTokensApiData): LoginResponse => ({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  tokenType: tokens.token_type,
  expiresIn: tokens.expires_in,
});

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  return requestAuthData(
    api.post<ApiResponse<LoginResponse>>("/auth/login/email", body),
    "로그인에 실패했습니다."
  );
};

export const logoutApi = async (): Promise<void> => {
  await requestAuthData(api.post<ApiResponse<null>>("/auth/logout"), "로그아웃에 실패했습니다.");
};

export const smsSendApi = async (body: SmsSendRequest): Promise<void> => {
  await requestAuthData(
    api.post<ApiResponse<null>>("/auth/sms/send", body),
    "인증번호 발송에 실패했습니다."
  );
};

export const smsVerifyApi = async (body: SmsVerifyRequest): Promise<void> => {
  try {
    await api.post<AuthApiResponse<string>>("/auth/sms/verify", body);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "인증번호가 올바르지 않습니다."), {
      cause: error,
    });
  }
};

export const signupApi = async (body: SignupRequest): Promise<void> => {
  await requestAuthData(
    api.post<ApiResponse<null>>("/auth/signup", body),
    "회원가입에 실패했습니다."
  );
};

export const socialSignupApi = async (body: SocialSignupRequest): Promise<SocialSignupResponse> => {
  try {
    const res = await api.post<SocialSignupApiResponse>("/auth/signup/social", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "소셜 회원가입에 실패했습니다."), {
      cause: error,
    });
  }
};

export const refreshTokenApi = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const body: RefreshTokenRequest = { refresh_token: refreshToken };
    const res = await api.post<AuthApiResponse<AuthTokensApiData>>("/auth/token/refresh", body);

    return mapAuthTokens(res.data.data);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "토큰 재발급에 실패했습니다."), {
      cause: error,
    });
  }
};

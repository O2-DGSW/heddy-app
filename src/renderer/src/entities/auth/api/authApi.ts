import { isAxiosError } from "axios";

import { api } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/lib/api";
import type {
  AuthApiResponse,
  AuthTokensApiData,
  EmailAvailabilityApiResponse,
  EmailAvailabilityParams,
  EmailAvailabilityResponse,
  LoginApiResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  ResetPasswordApiResponse,
  ResetPasswordRequest,
  SignupApiResponse,
  SignupRequest,
  SignupResponse,
  SocialLoginApiResponse,
  SocialLoginRequest,
  SocialLoginResponse,
  SocialSignupApiResponse,
  SocialSignupRequest,
  SocialSignupResponse,
  SmsSendRequest,
  SmsVerifyRequest,
} from "@/entities";

const getAuthApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data.error?.message || error.response?.data.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const mapAuthTokens = (tokens: AuthTokensApiData): LoginResponse => ({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  tokenType: tokens.token_type,
  expiresIn: tokens.expires_in,
});

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await api.post<LoginApiResponse>("/auth/login/email", body);
    return mapAuthTokens(res.data.data.tokens);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "로그인에 실패했습니다."), {
      cause: error,
    });
  }
};

export const socialLoginApi = async (body: SocialLoginRequest): Promise<SocialLoginResponse> => {
  try {
    const res = await api.post<SocialLoginApiResponse>("/auth/login/social", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "소셜 로그인에 실패했습니다."), {
      cause: error,
    });
  }
};

export const checkEmailAvailabilityApi = async (
  email: string
): Promise<EmailAvailabilityResponse> => {
  try {
    const params: EmailAvailabilityParams = { email };
    const res = await api.post<EmailAvailabilityApiResponse>(
      "/auth/email-availability",
      undefined,
      { params }
    );

    return res.data.data;
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "이메일 사용 가능 여부 확인에 실패했습니다."), {
      cause: error,
    });
  }
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  try {
    const body: LogoutRequest = { refresh_token: refreshToken };
    await api.post("/auth/logout", body);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "로그아웃에 실패했습니다."), {
      cause: error,
    });
  }
};

export const smsSendApi = async (body: SmsSendRequest): Promise<void> => {
  try {
    await api.post<AuthApiResponse<string>>("/auth/sms/send", body);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "인증번호 발송에 실패했습니다."), {
      cause: error,
    });
  }
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

export const resetPasswordApi = async (body: ResetPasswordRequest): Promise<void> => {
  try {
    await api.post<ResetPasswordApiResponse>("/auth/password/reset", body);
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "비밀번호 재설정에 실패했습니다."), {
      cause: error,
    });
  }
};

export const signupApi = async (body: SignupRequest): Promise<SignupResponse> => {
  try {
    const res = await api.post<SignupApiResponse>("/auth/signup/email", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getAuthApiErrorMessage(error, "회원가입에 실패했습니다."), {
      cause: error,
    });
  }
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

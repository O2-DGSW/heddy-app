import { apiClient, getApiErrorMessage } from "@heddy/api";
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
  ReauthenticateApiResponse,
  ReauthenticateRequest,
  ReauthenticateResponse,
  ResetPasswordApiResponse,
  ResetPasswordRequest,
  SignupApiResponse,
  SignupRequest,
  SignupResponse,
  SmsSendRequest,
  SmsVerifyRequest,
} from "../model/auth.types";

const mapAuthTokens = (tokens: AuthTokensApiData): LoginResponse => ({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  tokenType: tokens.token_type,
  expiresIn: tokens.expires_in,
});

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await apiClient.post<LoginApiResponse>("/auth/login/email", body);
    return mapAuthTokens(res.data.data.tokens);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "로그인에 실패했습니다."), {
      cause: error,
    });
  }
};

export const checkEmailAvailabilityApi = async (
  email: string
): Promise<EmailAvailabilityResponse> => {
  try {
    const params: EmailAvailabilityParams = { email };
    const res = await apiClient.post<EmailAvailabilityApiResponse>(
      "/auth/email-availability",
      undefined,
      { params }
    );

    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "이메일 사용 가능 여부 확인에 실패했습니다."), {
      cause: error,
    });
  }
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  try {
    const body: LogoutRequest = { refresh_token: refreshToken };
    await apiClient.post("/auth/logout", body);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "로그아웃에 실패했습니다."), {
      cause: error,
    });
  }
};

export const smsSendApi = async (body: SmsSendRequest): Promise<void> => {
  try {
    await apiClient.post<AuthApiResponse<string>>("/auth/sms/send", body);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "인증번호 발송에 실패했습니다."), {
      cause: error,
    });
  }
};

export const smsVerifyApi = async (body: SmsVerifyRequest): Promise<void> => {
  try {
    await apiClient.post<AuthApiResponse<string>>("/auth/sms/verify", body);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "인증번호가 올바르지 않습니다."), {
      cause: error,
    });
  }
};

export const resetPasswordApi = async (body: ResetPasswordRequest): Promise<void> => {
  try {
    await apiClient.post<ResetPasswordApiResponse>("/auth/password/reset", body);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "비밀번호 재설정에 실패했습니다."), {
      cause: error,
    });
  }
};

export const reauthenticateApi = async (
  body: ReauthenticateRequest
): Promise<ReauthenticateResponse> => {
  try {
    const res = await apiClient.post<ReauthenticateApiResponse>("/auth/reauthenticate", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "비밀번호를 확인하지 못했습니다."), {
      cause: error,
    });
  }
};

export const signupApi = async (body: SignupRequest): Promise<SignupResponse> => {
  try {
    const res = await apiClient.post<SignupApiResponse>("/auth/signup/email", body);
    return res.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "회원가입에 실패했습니다."), {
      cause: error,
    });
  }
};

export const refreshTokenApi = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const body: RefreshTokenRequest = { refresh_token: refreshToken };
    const res = await apiClient.post<AuthApiResponse<AuthTokensApiData>>(
      "/auth/token/refresh",
      body
    );

    return mapAuthTokens(res.data.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "토큰 재발급에 실패했습니다."), {
      cause: error,
    });
  }
};

import { api } from "@/shared/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SmsSendRequest,
  SmsVerifyRequest,
} from "@/entities/auth/model/auth.types";

type AuthApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error: { code: string; message: string } | null;
};

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<AuthApiResponse<LoginResponse>>("/auth/login", body);
  if (!res.data.success) {
    throw new Error(res.data.error?.message || res.data.message || "로그인에 실패했습니다.");
  }
  return res.data.data;
};

export const smsSendApi = async (body: SmsSendRequest): Promise<void> => {
  const res = await api.post<AuthApiResponse<null>>("/auth/sms/send", body);
  if (!res.data.success) {
    throw new Error(res.data.error?.message || res.data.message || "인증번호 발송에 실패했습니다.");
  }
};

export const smsVerifyApi = async (body: SmsVerifyRequest): Promise<void> => {
  const res = await api.post<AuthApiResponse<null>>("/auth/sms/verify", body);
  if (!res.data.success) {
    throw new Error(res.data.error?.message || res.data.message || "인증번호가 올바르지 않습니다.");
  }
};

export const signupApi = async (body: SignupRequest): Promise<void> => {
  const res = await api.post<AuthApiResponse<null>>("/auth/signup", body);
  if (!res.data.success) {
    throw new Error(res.data.error?.message || res.data.message || "회원가입에 실패했습니다.");
  }
};

export const refreshTokenApi = async (refreshToken: string): Promise<LoginResponse> => {
  const res = await api.post<AuthApiResponse<LoginResponse>>("/auth/token/refresh", undefined, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  if (!res.data.success) {
    throw new Error(res.data.error?.message || res.data.message || "토큰 재발급에 실패했습니다.");
  }
  return res.data.data;
};

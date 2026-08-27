export type LoginRequest = {
  loginId: string;
  password: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type LoginResponse = AuthTokensResponse;

export type AuthTokensApiData = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type AuthApiResponse<TData> = {
  data: TData;
  request_id: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
  phone_number: string;
  agreements: SocialSignupAgreements;
};

export type SignupResponse = SocialSignupResponse;

export type SignupApiResponse = AuthApiResponse<SignupResponse>;

export type SocialSignupProviderType = "EMAIL" | "KAKAO" | "NAVER" | "GOOGLE";

export type SocialSignupAgreements = {
  terms_of_service: boolean;
  privacy_policy: boolean;
  ai_training: boolean;
  service_analytics: boolean;
  marketing_notification: boolean;
};

export type SocialSignupRequest = {
  provider: SocialSignupProviderType;
  provider_token: string;
  nickname: string;
  phone_number: string;
  agreements: SocialSignupAgreements;
};

export type SocialSignupResponse = {
  user: {
    user_id: string;
    email: string;
    nickname: string;
    status: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
};

export type SocialSignupApiResponse = {
  data: SocialSignupResponse;
  request_id: string;
};

export type SmsPurpose = "SIGNUP" | "OWNER_SIGNUP" | "PASSWORD_RESET" | "PHONE_CHANGE";

export type SmsSendRequest = {
  phone_number: string;
  carrier: string;
  purpose: SmsPurpose;
};

export type SmsVerifyRequest = {
  phone_number: string;
  code: string;
  purpose: SmsPurpose;
};

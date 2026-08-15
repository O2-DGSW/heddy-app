export type LoginRequest = {
  loginId: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type SignupRequest = {
  loginId: string;
  password: string;
  name: string;
  phoneNumber: string;
};

export type SmsPurpose = "SIGNUP" | "OWNER_SIGNUP" | "PASSWORD_RESET" | "PHONE_CHANGE";

export type SmsSendRequest = {
  phoneNumber: string;
  carrier: string;
  purpose: SmsPurpose;
};

export type SmsVerifyRequest = {
  phoneNumber: string;
  code: string;
  purpose: SmsPurpose;
};

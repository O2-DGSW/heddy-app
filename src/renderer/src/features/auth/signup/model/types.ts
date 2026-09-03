import type { SocialSignupAgreements } from "@/entities/auth";

export type MainCarrier = "SKT" | "KT" | "LG U+";
export type MvnoCarrier = "SKT 알뜰폰" | "KT 알뜰폰" | "LGU+ 알뜰폰";

export type Carrier = MainCarrier | MvnoCarrier;
export type SignupAgreements = SocialSignupAgreements;
export type SignupAgreementKey = keyof SignupAgreements;

export type SignupAgreementItem = {
  key: SignupAgreementKey;
  label: string;
  description: string;
  required: boolean;
};

export type BaseAccountForm = {
  id: string;
  password: string;
  passwordConfirm: string;
  name: string;
  carrier: Carrier;
  phone: string;
  verificationCode: string;
  agreements: SignupAgreements;
};

export type CustomerAccountForm = {
  id: string;
  password: string;
  passwordConfirm: string;
  name: string;
  carrier: Carrier;
  phone: string;
  verificationCode: string;
  agreements: SignupAgreements;
};

import type { SocialSignupAgreements } from "@/entities/auth";

export type MainCarrier = "SKT" | "KT" | "LG U+";
export type MvnoCarrier = "SKT 알뜰폰" | "KT 알뜰폰" | "LGU+ 알뜰폰";

export type Carrier = MainCarrier | MvnoCarrier;
export type SignupAgreements = SocialSignupAgreements;
export type SignupAgreementKey = keyof SignupAgreements;

export type HairLengthType = "SHORT" | "BELOW_CHIN" | "BELOW_SHOULDER" | "BELOW_CHEST";
export type HairConditionType = "HEALTHY" | "NORMAL" | "DAMAGED" | "SEVERELY_DAMAGED";
export type HairType = "STRAIGHT" | "WAVY" | "CURLY";
export type HairThicknessType = "THIN" | "NORMAL" | "THICK";

export interface HairProfileForm {
  hairLength: HairLengthType;
  hairCondition: HairConditionType;
  hairType: HairType;
  hairThickness: HairThicknessType;
  availableCareTimeMinutes: string;
}

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
  hairProfile: HairProfileForm;
  agreements: SignupAgreements;
};

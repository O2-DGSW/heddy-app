import type {
  Carrier,
  SignupHairConditionType,
  SignupHairLengthType,
  SignupHairThicknessType,
  SignupHairType,
  SignupAgreements,
} from "@/entities/auth";

export type { SignupAgreements };
export type SignupAgreementKey = keyof SignupAgreements;

export type HairLengthType = SignupHairLengthType;
export type HairConditionType = SignupHairConditionType;
export type HairType = SignupHairType;
export type HairThicknessType = SignupHairThicknessType;

export interface HairProfileForm {
  hairLength: HairLengthType;
  hairCondition: HairConditionType;
  hairType: HairType;
  hairThickness: HairThicknessType;
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

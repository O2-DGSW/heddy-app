export type MemberType = "customer" | "owner";

export type SignupStep = "type-select" | "terms" | "account" | "shop";

export type MainCarrier = "SKT" | "KT" | "LG U+";
export type MvnoCarrier = "SKT 알뜰폰" | "KT 알뜰폰" | "LGU+ 알뜰폰";
export type Carrier = MainCarrier | MvnoCarrier;

export type BaseAccountForm = {
  id: string;
  password: string;
  passwordConfirm: string;
  name: string;
  carrier: Carrier;
  phone: string;
  verificationCode: string;
};

export type CustomerAccountForm = BaseAccountForm;

export type ShopForm = {
  shopName: string;
  address: string;
  addressDetail: string;
  category: string;
  landline: string;
  storeEmail: string;
  businessNumber: string;
};

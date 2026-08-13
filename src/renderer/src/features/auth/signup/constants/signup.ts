import type { MainCarrier, MvnoCarrier } from "@/features/auth/signup/model/types";

export const MAIN_CARRIERS: MainCarrier[] = ["SKT", "KT", "LG U+"];

export const MVNO_CARRIERS: MvnoCarrier[] = ["SKT 알뜰폰", "KT 알뜰폰", "LGU+ 알뜰폰"];

export const SHOP_CATEGORIES = [
  "일반 미용실",
  "바버샵",
  "남성 전문 미용실",
  "프리미엄 살롱",
  "프랜차이즈 미용실",
] as const;

import type {
  MainCarrier,
  MvnoCarrier,
  SignupAgreementItem,
  SignupAgreementKey,
} from "@/features/auth/signup/model/types";

export const MAIN_CARRIERS: MainCarrier[] = ["SKT", "KT", "LG U+"];

export const MVNO_CARRIERS: MvnoCarrier[] = ["SKT 알뜰폰", "KT 알뜰폰", "LGU+ 알뜰폰"];

export const REQUIRED_SIGNUP_AGREEMENT_KEYS: SignupAgreementKey[] = [
  "terms_of_service",
  "privacy_policy",
];

export const SIGNUP_AGREEMENT_ITEMS: SignupAgreementItem[] = [
  {
    key: "terms_of_service",
    label: "서비스 이용약관",
    description: "헤디 서비스 이용을 위한 필수 약관입니다.",
    required: true,
  },
  {
    key: "privacy_policy",
    label: "개인정보 처리방침",
    description: "회원 식별과 서비스 제공을 위한 필수 동의입니다.",
    required: true,
  },
  {
    key: "ai_training",
    label: "AI 학습 활용 동의",
    description: "더 나은 추천 품질을 위해 시술 기록을 활용합니다.",
    required: false,
  },
  {
    key: "service_analytics",
    label: "서비스 분석 동의",
    description: "서비스 개선을 위한 통계 분석에 활용합니다.",
    required: false,
  },
  {
    key: "marketing_notification",
    label: "마케팅 알림 수신 동의",
    description: "혜택과 이벤트 알림을 받을 수 있습니다.",
    required: false,
  },
];

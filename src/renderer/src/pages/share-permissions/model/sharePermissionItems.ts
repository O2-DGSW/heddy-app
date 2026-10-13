import type { ConsentStatusResponse, ConsentType } from "@/entities/consent";
import type { GetSharesParams, ShareFieldType, ShareSummaryResponse } from "@/entities/share";

import type { SharePermissionItem } from "./types";

const DEFAULT_CONSENT_POLICY_VERSION = "2026-08-01";
const ACTIVE_SHARE_LIST_SIZE = 50;
export const ACTIVE_SHARE_PARAMS: GetSharesParams = {
  status: "ACTIVE",
  size: ACTIVE_SHARE_LIST_SIZE,
};
export const SHARE_ITEM_PREFIX = "share:";
export const EMPTY_SHARES: ShareSummaryResponse[] = [];

export type ManagedConsentType = Extract<
  ConsentType,
  "AI_TRAINING" | "SERVICE_ANALYTICS" | "PUSH_NOTIFICATION"
>;

interface ConsentPermissionConfig {
  consentType: ManagedConsentType;
  title: string;
  description: string;
}

interface ChangedConsent {
  consentType: ManagedConsentType;
  body: {
    granted: boolean;
    policy_version: string;
  };
}

export const CONSENT_PERMISSION_ITEMS: ConsentPermissionConfig[] = [
  {
    consentType: "AI_TRAINING",
    title: "AI 학습 활용 동의",
    description: "내 사진 및 시술 기록을 모델 학습에 활용",
  },
  {
    consentType: "SERVICE_ANALYTICS",
    title: "서비스 분석 동의",
    description: "서비스 개선을 위한 통계 분석에 활용",
  },
  {
    consentType: "PUSH_NOTIFICATION",
    title: "알림 수신 동의",
    description: "분석 완료 및 공유 만료 알림 수신",
  },
];

const SHARE_FIELD_LABEL_BY_TYPE: Record<ShareFieldType, string> = {
  PHOTOS: "사진",
  TREATMENT_DETAILS: "시술 내용",
  SATISFACTION: "만족도",
  CAUTIONS: "주의사항",
  MEMO: "메모",
  SAVED_STYLES: "후보 스타일",
};

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export const getConsentStatusByType = (consents: ConsentStatusResponse[] = []) =>
  consents.reduce<Partial<Record<ConsentType, ConsentStatusResponse>>>((statusByType, consent) => {
    statusByType[consent.consent_type] = consent;
    return statusByType;
  }, {});

const formatDate = (dateTime: string) => {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "만료일 확인 필요";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const formatShareFields = (fields: ShareFieldType[]) => {
  if (fields.length === 0) {
    return "공유 항목 없음";
  }

  return fields.map(field => SHARE_FIELD_LABEL_BY_TYPE[field]).join(", ");
};

const getShareItemId = (shareId: string) => `${SHARE_ITEM_PREFIX}${shareId}`;

export const getShareIdFromItemId = (itemId: string) => itemId.slice(SHARE_ITEM_PREFIX.length);

export const buildShareItem = (
  share: ShareSummaryResponse,
  revokedShareIds: ReadonlySet<string>
): SharePermissionItem => {
  const isRevoked = revokedShareIds.has(share.share_id);

  return {
    id: getShareItemId(share.share_id),
    title: `공유 링크 ${share.share_id.slice(0, 8)}`,
    description: `${formatShareFields(share.fields)} · ${formatDate(share.expires_at)}까지`,
    enabled: !isRevoked,
  };
};

export const getChangedConsents = (
  consentGrantedByType: Partial<Record<ManagedConsentType, boolean>>,
  consentStatusByType: Partial<Record<ConsentType, ConsentStatusResponse>>
) =>
  CONSENT_PERMISSION_ITEMS.flatMap<ChangedConsent>(item => {
    const nextGranted = consentGrantedByType[item.consentType];

    if (nextGranted === undefined) {
      return [];
    }

    const currentConsent = consentStatusByType[item.consentType];

    if (currentConsent?.granted === nextGranted) {
      return [];
    }

    return [
      {
        consentType: item.consentType,
        body: {
          granted: nextGranted,
          policy_version: currentConsent?.policy_version || DEFAULT_CONSENT_POLICY_VERSION,
        },
      },
    ];
  });

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { restoreAuthSession } from "@/entities/auth";
import { useGetConsents, usePutConsent } from "@/entities/consent";
import type { ConsentStatusResponse, ConsentType } from "@/entities/consent";
import { useDeleteShare, useGetShares } from "@/entities/share";
import type { GetSharesParams, ShareFieldType, ShareSummaryResponse } from "@/entities/share";

import type { SharePermissionItem, SharePermissionSection } from "./types";

const DEFAULT_CONSENT_POLICY_VERSION = "2026-08-01";
const ACTIVE_SHARE_LIST_SIZE = 50;
const ACTIVE_SHARE_PARAMS: GetSharesParams = { status: "ACTIVE", size: ACTIVE_SHARE_LIST_SIZE };
const SHARE_ITEM_PREFIX = "share:";
const EMPTY_SHARES: ShareSummaryResponse[] = [];

type AuthStatusType = "checking" | "authenticated";

type ManagedConsentType = Extract<
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

const CONSENT_PERMISSION_ITEMS: ConsentPermissionConfig[] = [
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

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const getConsentStatusByType = (consents: ConsentStatusResponse[] = []) =>
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

const getShareIdFromItemId = (itemId: string) => itemId.slice(SHARE_ITEM_PREFIX.length);

const buildShareItem = (
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

const getChangedConsents = (
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

export const useSharePermissions = () => {
  const navigate = useNavigate();
  const [authStatus, setAuthStatus] = useState<AuthStatusType>("checking");
  const isAuthenticated = authStatus === "authenticated";
  const {
    data: consents,
    error: consentsError,
    isFetching: isConsentsFetching,
    refetch: refetchConsents,
  } = useGetConsents({ enabled: isAuthenticated });
  const {
    data: shares,
    error: sharesError,
    isFetching: isSharesFetching,
    refetch: refetchShares,
  } = useGetShares(ACTIVE_SHARE_PARAMS, { enabled: isAuthenticated });
  const { mutateAsync: putConsent, isPending: isConsentSaving } = usePutConsent();
  const { mutateAsync: deleteShare, isPending: isShareSaving } = useDeleteShare();

  const [consentGrantedByType, setConsentGrantedByType] = useState<
    Partial<Record<ManagedConsentType, boolean>>
  >({});
  const [revokedShareIds, setRevokedShareIds] = useState<Set<string>>(new Set());
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const consentStatusByType = useMemo(
    () => getConsentStatusByType(consents?.items),
    [consents?.items]
  );
  const isFetching = authStatus === "checking" || isConsentsFetching || isSharesFetching;
  const isSaving = isConsentSaving || isShareSaving;
  const loadErrorMessage =
    consentsError || sharesError
      ? getErrorMessage(consentsError ?? sharesError, "공유 권한 정보를 불러오지 못했습니다.")
      : null;
  const actionErrorMessage = saveErrorMessage ?? loadErrorMessage;
  const activeShares = shares?.items ?? EMPTY_SHARES;
  const changedConsents = useMemo(
    () => getChangedConsents(consentGrantedByType, consentStatusByType),
    [consentGrantedByType, consentStatusByType]
  );
  const revokedShareIdList = useMemo(() => Array.from(revokedShareIds), [revokedShareIds]);
  const hasChanges = changedConsents.length > 0 || revokedShareIdList.length > 0;

  const sections = useMemo<SharePermissionSection[]>(() => {
    if (isFetching && !consents && !shares) {
      return [];
    }

    const agreementItems = CONSENT_PERMISSION_ITEMS.map(item => {
      const consentStatus = consentStatusByType[item.consentType];

      return {
        id: item.consentType,
        title: item.title,
        description: item.description,
        enabled: consentGrantedByType[item.consentType] ?? consentStatus?.granted ?? false,
      };
    });
    const shareItems =
      activeShares.length > 0
        ? activeShares.map(share => buildShareItem(share, revokedShareIds))
        : [
            {
              id: "empty-share",
              title: "공유 중인 기록이 없습니다",
              description: "생성된 활성 공유 링크가 없습니다",
              enabled: false,
              canToggle: false,
              disabled: true,
            },
          ];

    return [
      {
        id: "agreement",
        title: "동의 항목",
        items: agreementItems,
      },
      {
        id: "share-status",
        title: "공유 링크별 상태",
        items: shareItems,
      },
    ];
  }, [
    activeShares,
    consentGrantedByType,
    consentStatusByType,
    consents,
    isFetching,
    revokedShareIds,
    shares,
  ]);

  useEffect(() => {
    let isMounted = true;

    void restoreAuthSession().then(isRestored => {
      if (!isMounted) {
        return;
      }

      if (!isRestored) {
        navigate("/login", { replace: true });
        return;
      }

      setAuthStatus("authenticated");
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggle = (itemId: string) => {
    setSaveErrorMessage(null);

    if (itemId.startsWith(SHARE_ITEM_PREFIX)) {
      const shareId = getShareIdFromItemId(itemId);
      setRevokedShareIds(currentShareIds => {
        const nextShareIds = new Set(currentShareIds);

        if (nextShareIds.has(shareId)) {
          nextShareIds.delete(shareId);
        } else {
          nextShareIds.add(shareId);
        }

        return nextShareIds;
      });
      return;
    }

    const consentConfig = CONSENT_PERMISSION_ITEMS.find(item => item.consentType === itemId);

    if (!consentConfig) {
      return;
    }

    const { consentType } = consentConfig;
    const currentGranted =
      consentGrantedByType[consentType] ?? consentStatusByType[consentType]?.granted ?? false;

    setConsentGrantedByType(currentConsentGrantedByType => ({
      ...currentConsentGrantedByType,
      [consentType]: !currentGranted,
    }));
  };

  const handleRetry = () => {
    setSaveErrorMessage(null);
    void refetchConsents();
    void refetchShares();
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    if (isFetching || isSaving || loadErrorMessage) {
      return;
    }

    setSaveErrorMessage(null);

    try {
      await Promise.all([
        ...changedConsents.map(changedConsent => putConsent(changedConsent)),
        ...revokedShareIdList.map(shareId => deleteShare(shareId)),
      ]);

      navigate(-1);
    } catch (error) {
      setSaveErrorMessage(getErrorMessage(error, "공유 권한 저장에 실패했습니다."));
    }
  };

  return {
    actionErrorMessage,
    handleBack,
    handleClose,
    handleRetry,
    handleSave,
    handleToggle,
    isFetching,
    isSaveDisabled: isFetching || isSaving || Boolean(loadErrorMessage) || !hasChanges,
    isSaving,
    loadErrorMessage,
    sections,
  };
};

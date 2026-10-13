import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetConsents, usePutConsent } from "@/entities/consent";
import { useDeleteShare, useGetShares } from "@/entities/share";

import {
  ACTIVE_SHARE_PARAMS,
  CONSENT_PERMISSION_ITEMS,
  EMPTY_SHARES,
  SHARE_ITEM_PREFIX,
  buildShareItem,
  getChangedConsents,
  getConsentStatusByType,
  getErrorMessage,
  getShareIdFromItemId,
} from "./sharePermissionItems";
import type { ManagedConsentType } from "./sharePermissionItems";
import type { SharePermissionSection } from "./types";

export const useSharePermissions = () => {
  const navigate = useNavigate();
  const {
    data: consents,
    error: consentsError,
    isFetching: isConsentsFetching,
    refetch: refetchConsents,
  } = useGetConsents();
  const {
    data: shares,
    error: sharesError,
    isFetching: isSharesFetching,
    refetch: refetchShares,
  } = useGetShares(ACTIVE_SHARE_PARAMS);
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
  const isFetching = isConsentsFetching || isSharesFetching;
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

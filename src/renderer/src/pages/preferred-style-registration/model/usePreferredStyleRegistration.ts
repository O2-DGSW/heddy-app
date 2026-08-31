import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetStylePreferences, useGetStyleTags, usePutStylePreferences } from "@/entities/style";
import type {
  StylePreferencesRequest,
  StylePreferencesResponse,
  StyleTagResponse,
} from "@/entities/style";

import { getIsTagDisabled, getNextTagStatus } from "../lib/styleTag";
import { MAX_STYLE_TAG_SELECTION, TAB_LABEL_BY_TYPE } from "./constants";
import type { PreferredStyleTabType, StyleTag, StyleTagStatusType } from "./types";

const formatStyleTagLabel = (tagName: string) => {
  const trimmedTagName = tagName.trim();
  return trimmedTagName.startsWith("#") ? trimmedTagName : `#${trimmedTagName}`;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const buildStyleTags = (
  serverTags: StyleTagResponse[],
  preferences: StylePreferencesResponse | undefined,
  statusById: Partial<Record<string, StyleTagStatusType>>
): StyleTag[] => {
  const preferredTagIds = new Set(preferences?.preferred_tag_ids ?? []);
  const excludedTagIds = new Set(preferences?.excluded_tag_ids ?? []);

  return serverTags.map(tag => {
    const overriddenStatus = statusById[tag.style_tag_id];
    const status: StyleTagStatusType =
      overriddenStatus ??
      (preferredTagIds.has(tag.style_tag_id)
        ? "preferred"
        : excludedTagIds.has(tag.style_tag_id)
          ? "excluded"
          : "none");

    return {
      id: tag.style_tag_id,
      label: formatStyleTagLabel(tag.tag_name),
      status,
    };
  });
};

export const usePreferredStyleRegistration = () => {
  const navigate = useNavigate();
  const {
    data: styleTagData,
    error: styleTagError,
    isFetching: isStyleTagsFetching,
    refetch: refetchStyleTags,
  } = useGetStyleTags();
  const {
    data: stylePreferences,
    error: stylePreferencesError,
    isFetching: isStylePreferencesFetching,
    refetch: refetchStylePreferences,
  } = useGetStylePreferences();
  const { mutateAsync: putStylePreferences, isPending: isSaving } = usePutStylePreferences();

  const [activeTab, setActiveTab] = useState<PreferredStyleTabType>("preferred");
  const [styleTagStatusById, setStyleTagStatusById] = useState<
    Partial<Record<string, StyleTagStatusType>>
  >({});
  const [isPreferredSummaryExpanded, setIsPreferredSummaryExpanded] = useState(false);
  const [isExcludedSummaryExpanded, setIsExcludedSummaryExpanded] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const styleTags = useMemo(
    () =>
      styleTagData ? buildStyleTags(styleTagData.items, stylePreferences, styleTagStatusById) : [],
    [stylePreferences, styleTagData, styleTagStatusById]
  );
  const preferredTags = useMemo(
    () => styleTags.filter(tag => tag.status === "preferred"),
    [styleTags]
  );
  const excludedTags = useMemo(
    () => styleTags.filter(tag => tag.status === "excluded"),
    [styleTags]
  );
  const isFetching = isStyleTagsFetching || isStylePreferencesFetching;
  const loadErrorMessage =
    styleTagError || stylePreferencesError
      ? getErrorMessage(
          styleTagError ?? stylePreferencesError,
          "스타일 정보를 불러오지 못했습니다."
        )
      : null;
  const actionErrorMessage = saveErrorMessage ?? loadErrorMessage;
  const isSaveDisabled = isFetching || isSaving || Boolean(loadErrorMessage);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabClick = (tab: PreferredStyleTabType) => {
    setSaveErrorMessage(null);
    setActiveTab(tab);
  };

  const handleTagClick = (tagId: string) => {
    const targetTag = styleTags.find(tag => tag.id === tagId);

    if (!targetTag || getIsTagDisabled(targetTag.status, activeTab)) {
      return;
    }

    const nextStatus = getNextTagStatus(targetTag.status, activeTab);
    const isAddingTag = targetTag.status === "none" && nextStatus === activeTab;
    const selectedCount = styleTags.filter(tag => tag.status === activeTab).length;

    if (isAddingTag && selectedCount >= MAX_STYLE_TAG_SELECTION) {
      setSaveErrorMessage(
        `${TAB_LABEL_BY_TYPE[activeTab]} 태그는 최대 10개까지 선택할 수 있습니다.`
      );
      return;
    }

    setSaveErrorMessage(null);
    setStyleTagStatusById(currentStatusById => ({
      ...currentStatusById,
      [tagId]: nextStatus,
    }));
  };

  const handlePreferredSummaryToggle = () => {
    setIsPreferredSummaryExpanded(isExpanded => !isExpanded);
  };

  const handleExcludedSummaryToggle = () => {
    setIsExcludedSummaryExpanded(isExpanded => !isExpanded);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setSaveErrorMessage(null);
    setStyleTagStatusById({});
    void refetchStyleTags();
    void refetchStylePreferences();
  };

  const handleSave = async () => {
    if (isSaveDisabled) {
      return;
    }

    const body: StylePreferencesRequest = {
      preferred_tag_ids: preferredTags.map(tag => tag.id),
      excluded_tag_ids: excludedTags.map(tag => tag.id),
    };

    setSaveErrorMessage(null);

    try {
      await putStylePreferences(body);
      navigate(-1);
    } catch (error) {
      setSaveErrorMessage(getErrorMessage(error, "선호 스타일 저장에 실패했습니다."));
    }
  };

  return {
    activeTab,
    actionErrorMessage,
    excludedTags,
    handleBack,
    handleCancel,
    handleExcludedSummaryToggle,
    handlePreferredSummaryToggle,
    handleRetry,
    handleSave,
    handleTabClick,
    handleTagClick,
    isExcludedSummaryExpanded,
    isFetching,
    isPreferredSummaryExpanded,
    isSaveDisabled,
    isSaving,
    loadErrorMessage,
    preferredTags,
    styleTags,
  };
};

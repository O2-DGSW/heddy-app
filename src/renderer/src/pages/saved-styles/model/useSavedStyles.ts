import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { useDeleteSavedStyle, useGetSavedStyles } from "@/entities/saved-style";
import { useCreateShare } from "@/entities/share";

import { mapSavedStyleToItem } from "./mapSavedStyle";

/** 저장한 후보 스타일 화면의 로직 */
export const useSavedStyles = () => {
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState("");

  const { data, isPending, isError, error } = useGetSavedStyles();
  const deleteSavedStyle = useDeleteSavedStyle();
  const createShare = useCreateShare();

  const savedStyles = useMemo(() => (data?.items ?? []).map(mapSavedStyleToItem), [data?.items]);

  const handleBack = () => {
    setDirection("back");
    navigate(-1);
  };

  const handleDelete = (styleId: string) => {
    deleteSavedStyle.mutate(styleId);
  };

  /** 공유 링크는 생성 시점에만 내려오므로 받은 자리에서 들고 있는다 */
  const handleShare = (styleId: string) => {
    createShare.mutate(
      { saved_style_ids: [styleId], fields: ["SAVED_STYLES"] },
      { onSuccess: share => setShareUrl(share.share_url) }
    );
  };

  const handleCloseShareResult = () => {
    setShareUrl("");
  };

  const handleRetryWithAr = () => {
    setDirection("forward");
    navigate("/ar");
  };

  return {
    savedStyles,
    isPending,
    isError,
    loadErrorMessage: error?.message ?? "",
    shareUrl,
    isSharing: createShare.isPending,
    actionErrorMessage:
      (createShare.isError ? createShare.error.message : "") ||
      (deleteSavedStyle.isError ? deleteSavedStyle.error.message : ""),
    handleBack,
    handleCloseShareResult,
    handleDelete,
    handleRetryWithAr,
    handleShare,
  };
};

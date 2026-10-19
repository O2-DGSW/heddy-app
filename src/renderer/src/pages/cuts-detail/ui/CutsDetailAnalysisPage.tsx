import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import {
  CutsAnalysisConfidenceCard,
  CutsAnalysisIndicatorList,
  CutsAnalysisNotice,
  CutsAnalysisPhotoCard,
  CutsAnalysisProgress,
  CutsAnalysisSkeleton,
  CutsAnalysisStaleNotice,
  CutsRecordActions,
  useCutsAnalysis,
} from "@/features/cuts";

export const CutsDetailAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { view, photoUrl, handleRequestAnalysis, handleRetry, handleRefresh } = useCutsAnalysis(id);

  const handleEditPhoto = () => {
    setDirection("forward");
    navigate("../edit");
  };

  switch (view.status) {
    case "loading":
      return <CutsAnalysisSkeleton />;

    case "load-error":
      return (
        <CutsAnalysisNotice
          actionLabel="다시 불러오기"
          description={view.message}
          onAction={handleRefresh}
          title="분석 결과를 불러오지 못했어요"
        />
      );

    case "no-photo":
      return (
        <CutsAnalysisNotice
          actionLabel="사진 추가하기"
          description="시술 사진이 있어야 분석할 수 있어요. 기록에 사진을 추가해 주세요."
          onAction={handleEditPhoto}
          title="아직 분석 결과가 없어요"
        />
      );

    case "analyzing":
      return (
        <CutsAnalysisProgress
          isTakingLong={view.isTakingLong}
          onRefresh={handleRefresh}
          photoUrl={photoUrl}
          progress={view.progress}
        />
      );

    case "failed":
      return (
        <CutsAnalysisNotice
          actionLabel="다시 시도"
          description={view.message}
          onAction={handleRetry}
          title="분석하지 못했어요"
        />
      );

    case "unavailable":
      return (
        <CutsAnalysisNotice
          actionLabel="사진 바꾸기"
          description="사진에서 머리를 찾기 어려워요. 머리가 잘 보이는 밝은 사진으로 바꿔 주세요."
          onAction={handleEditPhoto}
          title="이 사진으로는 분석할 수 없어요"
        />
      );

    case "result":
      return (
        <div className="flex flex-col pb-6">
          {view.result.isStale && (
            <CutsAnalysisStaleNotice
              onReanalyze={view.canReanalyze ? handleRequestAnalysis : undefined}
            />
          )}
          <CutsAnalysisPhotoCard photoUrl={photoUrl} overlays={view.result.overlays} />
          <CutsAnalysisConfidenceCard
            percent={view.result.confidencePercent}
            description={view.result.confidenceDescription}
          />
          <CutsAnalysisIndicatorList indicators={view.result.indicators} />
          <CutsRecordActions className="px-4 pt-6" />
        </div>
      );
  }
};

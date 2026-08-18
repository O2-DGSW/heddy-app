import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsAnalysisPhotoCard } from "@/features/cuts/ui/analysis/CutsAnalysisPhotoCard";
import { CutsAnalysisConfidenceCard } from "@/features/cuts/ui/analysis/CutsAnalysisConfidenceCard";
import { CutsAnalysisIndicatorList } from "@/features/cuts/ui/analysis/CutsAnalysisIndicatorList";
import { CutsAnalysisActions } from "@/features/cuts/ui/analysis/CutsAnalysisActions";
import { dummyAnalysisResults } from "@/features/cuts/constrants/dummyAnalysisResults";

export const CutsDetailAnalysisPage = () => {
  const { id } = useParams();
  const analysisResult = dummyAnalysisResults.find(result => result.recordId === id);

  if (!analysisResult) {
    return (
      <p
        className={`flex flex-1 items-center justify-center ${font.body.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        분석 결과가 없어요
      </p>
    );
  }

  return (
    <div className="flex flex-col pb-6">
      <CutsAnalysisPhotoCard photoUrl={analysisResult.photoUrl} overlays={analysisResult.overlays} />
      <CutsAnalysisConfidenceCard
        percent={analysisResult.confidencePercent}
        description={analysisResult.confidenceDescription}
      />
      <CutsAnalysisIndicatorList indicators={analysisResult.indicators} />
      <CutsAnalysisActions />
    </div>
  );
};

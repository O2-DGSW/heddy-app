import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { useGetLatestAnalysis, useGetTreatmentRecord } from "@/entities/record";
import { CutsAnalysisPhotoCard } from "@/features/cuts/ui/analysis/CutsAnalysisPhotoCard";
import { CutsAnalysisConfidenceCard } from "@/features/cuts/ui/analysis/CutsAnalysisConfidenceCard";
import { CutsAnalysisIndicatorList } from "@/features/cuts/ui/analysis/CutsAnalysisIndicatorList";
import { CutsRecordActions } from "@/features/cuts/ui/CutsRecordActions";
import { CutsAnalysisStaleNotice } from "@/features/cuts/ui/analysis/CutsAnalysisStaleNotice";
import { mapAnalysisToResult, pickAnalysisPhotoUrl } from "@/features/cuts/model/mapAnalysis";

const CenteredMessage = ({ children }: { children: string }) => (
  <p
    className={`flex flex-1 items-center justify-center px-4 text-center ${font.body.regular}`}
    style={{ color: lightTheme.label.assistive }}
  >
    {children}
  </p>
);

export const CutsDetailAnalysisPage = () => {
  const { id } = useParams();

  const { data: analysis, isPending, isError, error } = useGetLatestAnalysis(id);
  // 분석 응답에는 사진이 없어서, 겹쳐 그릴 바탕 사진은 기록 단건 조회에서 가져온다.
  const { data: record } = useGetTreatmentRecord(id);

  const result = useMemo(() => (analysis ? mapAnalysisToResult(analysis) : null), [analysis]);
  const photoUrl = useMemo(() => pickAnalysisPhotoUrl(record?.photos), [record?.photos]);

  if (isPending) {
    return <CenteredMessage>분석 결과를 불러오는 중</CenteredMessage>;
  }

  if (isError) {
    return (
      <CenteredMessage>{error?.message ?? "분석 결과를 불러오지 못했습니다."}</CenteredMessage>
    );
  }

  // 분석한 적이 없으면 서버가 404를 주고, API에서 null로 바꿔 넘긴다.
  if (!result) {
    return <CenteredMessage>분석 결과가 없어요</CenteredMessage>;
  }

  return (
    <div className="flex flex-col pb-6">
      {result.isStale && <CutsAnalysisStaleNotice />}
      <CutsAnalysisPhotoCard photoUrl={photoUrl} overlays={result.overlays} />
      <CutsAnalysisConfidenceCard
        percent={result.confidencePercent}
        description={result.confidenceDescription}
      />
      <CutsAnalysisIndicatorList indicators={result.indicators} />
      <CutsRecordActions className="px-4 pt-6" />
    </div>
  );
};

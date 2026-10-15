import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";
import { font, lightTheme } from "@heddy/design-tokens";

import { useGetLatestAnalysis, useGetTreatmentRecord } from "@/entities/record";
import { CutsAnalysisPhotoCard } from "@/features/cuts";
import { CutsAnalysisConfidenceCard } from "@/features/cuts";
import { CutsAnalysisIndicatorList } from "@/features/cuts";
import { CutsRecordActions } from "@/features/cuts";
import { CutsAnalysisStaleNotice } from "@/features/cuts";
import { mapAnalysisToResult, pickAnalysisPhotoUrl } from "@/features/cuts";
import { cn } from "@/shared";

const CenteredMessage = ({ children }: { children: string }) => (
  <p
    className={`flex flex-1 items-center justify-center px-4 text-center ${font.body.regular}`}
    style={{ color: lightTheme.label.assistive }}
  >
    {children}
  </p>
);

interface AnalysisEmptyStateProps {
  hasPhoto: boolean;
  onAddPhoto: () => void;
}

/** 분석 결과가 없을 때 이유와 다음에 할 일을 알려 준다 */
const AnalysisEmptyState = ({ hasPhoto, onAddPhoto }: AnalysisEmptyStateProps) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
    <p className={font.body.semiBold} style={{ color: lightTheme.label.neutral }}>
      아직 분석 결과가 없어요
    </p>
    <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
      {hasPhoto
        ? "분석이 끝나면 이 탭에서 결과를 확인할 수 있어요."
        : "시술 사진이 있어야 분석할 수 있어요. 기록에 사진을 추가해 주세요."}
    </p>
    {!hasPhoto && (
      <button
        className={cn("mt-1 h-[42px] rounded-[10px] px-[20px]", font.label.semiBold)}
        onClick={onAddPhoto}
        style={{
          backgroundColor: lightTheme.primary.normal,
          color: lightTheme.label.buttonText,
        }}
        type="button"
      >
        사진 추가하기
      </button>
    )}
  </div>
);

export const CutsDetailAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: analysis, isPending, isError, error } = useGetLatestAnalysis(id);
  // 분석 응답에는 사진이 없어서, 겹쳐 그릴 바탕 사진은 기록 단건 조회에서 가져온다.
  const { data: record } = useGetTreatmentRecord(id);

  const result = useMemo(() => (analysis ? mapAnalysisToResult(analysis) : null), [analysis]);
  const photoUrl = useMemo(() => pickAnalysisPhotoUrl(record?.photos), [record?.photos]);

  const handleAddPhoto = () => {
    setDirection("forward");
    navigate("../edit");
  };

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
    return <AnalysisEmptyState hasPhoto={Boolean(photoUrl)} onAddPhoto={handleAddPhoto} />;
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

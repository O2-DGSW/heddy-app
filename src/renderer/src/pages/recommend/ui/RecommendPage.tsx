import { lightTheme } from "@heddy/design-tokens";

import { RecommendHeader } from "@/features/recommend";
import { RecommendBasisSection } from "@/features/recommend";
import { RecommendResultSection } from "@/features/recommend";
import { RecommendStatus } from "@/features/recommend";
import { useRecommendation } from "@/features/recommend";

export const RecommendPage = () => {
  const {
    items,
    basisRows,
    isEmpty,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    generate,
    isGenerating,
    generateError,
  } = useRecommendation();

  return (
    <cap-page>
      <section
        aria-labelledby="recommend-title"
        className="flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <RecommendHeader />
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-none no-scrollbar [-webkit-overflow-scrolling:touch]">
          {isPending && <RecommendStatus message="추천을 불러오는 중" />}

          {isError && (
            <RecommendStatus
              hasIllustration
              message={error?.message ?? "추천을 불러오지 못했습니다."}
              actionLabel="다시 시도"
              isActionPending={isRefetching}
              onAction={() => void refetch()}
            />
          )}

          {isEmpty && (
            <RecommendStatus
              hasIllustration
              message={
                generateError
                  ? generateError.message
                  : "아직 추천이 없어요\n시술기록을 바탕으로 추천을 만들어 드릴게요"
              }
              actionLabel="추천 받기"
              isActionPending={isGenerating}
              onAction={generate}
            />
          )}

          {items.length > 0 && <RecommendResultSection recommendations={items} />}

          {/* 근거 데이터는 추천 결과가 있을 때만 의미가 있어, 목록이 비면 함께 숨긴다 */}
          {items.length > 0 && basisRows.length > 0 && <RecommendBasisSection rows={basisRows} />}
        </div>
      </section>
    </cap-page>
  );
};

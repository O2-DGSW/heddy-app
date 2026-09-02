import { lightTheme } from "@heddy/design-tokens";

import { RecommendHeader } from "@/features/recommend/ui/RecommendHeader";
import { RecommendResultSection } from "@/features/recommend/ui/RecommendResultSection";
import { RecommendBasisSection } from "@/features/recommend/ui/RecommendBasisSection";
import { RecommendStatus } from "@/features/recommend/ui/RecommendStatus";
import { useRecommendation } from "@/features/recommend/model/hooks/useRecommendation";
import { dummyRecommendationBasisRows } from "@/features/recommend/constants/dummyRecommendationBasis";

export const RecommendPage = () => {
  const { items, isEmpty, isPending, isError, error, generate, isGenerating, generateError } =
    useRecommendation();

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
              isActionPending={isGenerating}
              onAction={generate}
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

          {items.length > 0 && (
            <>
              <RecommendResultSection recommendations={items} />
              <RecommendBasisSection rows={dummyRecommendationBasisRows} />
            </>
          )}
        </div>
      </section>
    </cap-page>
  );
};

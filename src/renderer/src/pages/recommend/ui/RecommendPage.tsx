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
    // 헤더를 스크롤 컨테이너(아래 flex-1 div) 밖의 별도 flex 아이템으로 분리해 고정한다.
    // sticky는 실기기 WKWebView에서 깨진 적이 있어 쓰지 않는다 — cuts 레이아웃과 동일한 패턴
    // (PAGE_SCROLL_PATHS에 "/recommend" 등록, <main>이 아니라 여기서 직접 스크롤한다).
    <section
      aria-labelledby="recommend-title"
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <RecommendHeader />
      {/* 상태 화면이 남는 공간 한가운데에 오도록 스크롤 영역을 flex 컬럼으로 둔다 */}
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

        {/* 추천을 한 번도 만든 적이 없으면 생성 버튼을 눌러 만들게 한다(POST는 자동 호출하지 않는다) */}
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
  );
};

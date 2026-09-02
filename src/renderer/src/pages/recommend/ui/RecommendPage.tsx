import { lightTheme } from "@heddy/design-tokens";

import { RecommendHeader } from "@/features/recommend/ui/RecommendHeader";
import { RecommendResultSection } from "@/features/recommend/ui/RecommendResultSection";
import { RecommendBasisSection } from "@/features/recommend/ui/RecommendBasisSection";
import { dummyRecommendations } from "@/features/recommend/constants/dummyRecommendations";
import { dummyRecommendationBasisRows } from "@/features/recommend/constants/dummyRecommendationBasis";

export const RecommendPage = () => {
  return (
    <cap-page>
      {/* 헤더를 스크롤 컨테이너(아래 flex-1 div) 밖의 별도 flex 아이템으로 분리해 고정한다.
        sticky는 실기기 WKWebView에서 깨진 적이 있어 쓰지 않는다 — cuts 레이아웃과 동일한 패턴
        (PAGE_SCROLL_PATHS에 "/recommend" 등록, <main>이 아니라 여기서 직접 스크롤한다). */}
      <section
        aria-labelledby="recommend-title"
        className="flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <RecommendHeader />
        <div className="flex-1 overflow-y-auto overscroll-none no-scrollbar [-webkit-overflow-scrolling:touch]">
          <RecommendResultSection recommendations={dummyRecommendations} />
          <RecommendBasisSection rows={dummyRecommendationBasisRows} />
        </div>
      </section>
    </cap-page>
  );
};

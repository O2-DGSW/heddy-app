import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendRankBadge } from "@/features/recommend/ui/RecommendRankBadge";
import { RecommendReasonBadge } from "@/features/recommend/ui/RecommendReasonBadge";
import { RecommendRiskBadge } from "@/features/recommend/ui/RecommendRiskBadge";
import { RecommendArButton } from "@/features/recommend/ui/RecommendArButton";
import type { RecommendationItem } from "@/features/recommend/model/types/Recommend.types";

interface RecommendCardProps {
  rank: number;
  recommendation: RecommendationItem;
}

export const RecommendCard = ({ rank, recommendation }: RecommendCardProps) => {
  return (
    <article
      className="flex flex-col gap-3 rounded-2xl p-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex gap-3">
        {/* 이 카드는 옆 텍스트 블록 높이에 맞춰 세로로 늘어나는 직사각형 썸네일을 쓴다
            (정사각형을 고정해야 하는 CutsRecordCard와는 다른 디자인 의도). */}
        <div
          className="w-28 shrink-0 self-stretch overflow-hidden rounded-xl"
          style={{ backgroundColor: lightTheme.fill.normal }}
        >
          {recommendation.thumbnailUrl && (
            <img
              src={recommendation.thumbnailUrl}
              alt={`${recommendation.styleName} 추천 스타일`}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <RecommendRankBadge rank={rank} />
            <RecommendReasonBadge reasonType={recommendation.reasonType} />
            <RecommendRiskBadge riskLevel={recommendation.riskLevel} />
          </div>
          <span className={font.headline2.bold} style={{ color: lightTheme.label.normal }}>
            {recommendation.styleName}
          </span>
          <p className={font.caption.regular} style={{ color: lightTheme.label.alternative }}>
            근거: {recommendation.reasonDescription}
          </p>
          <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
            참고기록: {recommendation.referenceRecordLabel}
          </p>
        </div>
      </div>

      <RecommendArButton />
    </article>
  );
};

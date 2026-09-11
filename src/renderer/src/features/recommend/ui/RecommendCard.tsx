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
    // AR 버튼까지 오른쪽 텍스트 열 안에 두고, 썸네일은 그 옆에 정사각형으로 둔다.
    // 좁은 기기(400px 이하)에서는 썸네일 폭과 폰트를 함께 줄여 텍스트가 깨지지 않게 한다.
    <article
      className="flex gap-3 rounded-2xl p-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] max-[400px]:gap-2 max-[400px]:p-2"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {/* 폭을 카드 기준 비율로 잡고 aspect-square로 높이를 따라가게 해서, 화면 폭이 달라져도
          정사각형이 유지된다.
          self-stretch + aspect-square는 높이↔폭이 서로를 참조해 폭이 0으로 무너지니 쓰지 말 것. */}
      <div
        className="aspect-square w-[30%] shrink-0 self-start overflow-hidden rounded-lg max-[360px]:w-[28%]"
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

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5 max-[400px]:gap-1">
          <RecommendRankBadge rank={rank} />
          {recommendation.reasonType && (
            <RecommendReasonBadge reasonType={recommendation.reasonType} />
          )}
          {recommendation.riskLevel && <RecommendRiskBadge riskLevel={recommendation.riskLevel} />}
        </div>

        <div className="flex flex-col gap-0.5">
          <span
            className={`${font.headline2.bold} text-[1rem] max-[400px]:text-[0.9375rem]`}
            style={{ color: lightTheme.label.normal }}
          >
            {recommendation.styleName}
          </span>
          {/* 서버가 근거·참고기록을 안 줄 수도 있어, 값이 없으면 라벨만 남지 않도록 줄째로 숨긴다.
              서버는 근거를 최대 네 개까지 주는데 시안은 한 줄이라, 가장 앞선 근거만 보여준다. */}
          {recommendation.reasonDescriptions.length > 0 && (
            <p
              className={`${font.caption.regular} line-clamp-2 max-[360px]:text-[0.6875rem]`}
              style={{ color: lightTheme.label.alternative }}
            >
              근거: {recommendation.reasonDescriptions[0]}
            </p>
          )}
          {recommendation.referenceRecordLabel && (
            <p
              className={`${font.caption.regular} max-[360px]:text-[0.6875rem]`}
              style={{ color: lightTheme.label.assistive }}
            >
              참고기록: {recommendation.referenceRecordLabel}
            </p>
          )}
        </div>

        {/* 시안처럼 참고기록 바로 아래에 붙인다 */}
        <div className="mt-0.5">
          <RecommendArButton />
        </div>
      </div>
    </article>
  );
};

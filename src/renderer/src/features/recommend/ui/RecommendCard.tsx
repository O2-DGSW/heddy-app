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
    // AR 버튼까지 오른쪽 텍스트 열 안에 두고, 썸네일이 그 전체 높이에 맞춰 늘어나는 구조다.
    // 좁은 기기(400px 이하)에서는 썸네일 폭과 폰트를 함께 줄여 텍스트가 깨지지 않게 한다.
    <article
      className="flex gap-3 rounded-2xl p-3 shadow-[0_1px_6px_rgba(0,0,0,0.06)] max-[400px]:gap-2 max-[400px]:p-2"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      {/* 폭을 카드 기준 비율로 잡고 aspect-square로 높이를 따라가게 해서, 화면 폭이 달라져도
          정사각형이 유지되면서 카드 아래(AR 버튼)까지 꽉 찬다.
          self-stretch + aspect-square는 높이↔폭이 서로를 참조해 폭이 0으로 무너지니 쓰지 말 것. */}
      <div
        className="aspect-square w-[42%] shrink-0 self-start overflow-hidden rounded-xl max-[360px]:w-[38%]"
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

      <div className="flex min-w-0 flex-1 flex-col gap-2">
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
          {/* 서버가 근거·참고기록을 안 줄 수도 있어, 값이 없으면 라벨만 남지 않도록 줄째로 숨긴다 */}
          {recommendation.reasonDescriptions.length > 0 && (
            <ul
              className={`${font.caption.regular} flex flex-col gap-0.5 max-[360px]:text-[0.6875rem]`}
              style={{ color: lightTheme.label.alternative }}
            >
              {recommendation.reasonDescriptions.map(reason => (
                <li key={reason}>· {reason}</li>
              ))}
            </ul>
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

        {/* 사진이 텍스트보다 높으면 버튼을 아래로 밀어 사진 하단과 나란히 맞춘다 */}
        <div className="mt-auto">
          <RecommendArButton />
        </div>
      </div>
    </article>
  );
};

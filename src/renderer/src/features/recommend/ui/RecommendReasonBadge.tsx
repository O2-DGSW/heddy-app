import { font, lightTheme } from "@heddy/design-tokens";

import type { RecommendReasonType } from "@/features/recommend/model/types/Recommend.types";

interface RecommendReasonBadgeProps {
  reasonType: RecommendReasonType;
}

export const RecommendReasonBadge = ({ reasonType }: RecommendReasonBadgeProps) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 max-[400px]:px-1.5 ${font.caption.medium} max-[400px]:text-[0.6875rem]`}
      style={{ backgroundColor: lightTheme.status.success, color: lightTheme.background.normal }}
    >
      {reasonType}
    </span>
  );
};

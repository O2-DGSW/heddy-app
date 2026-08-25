import { font, lightTheme } from "@heddy/design-tokens";

interface RecommendRankBadgeProps {
  rank: number;
}

export const RecommendRankBadge = ({ rank }: RecommendRankBadgeProps) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 ${font.caption.medium}`}
      style={{ borderColor: lightTheme.line.neutral, color: lightTheme.label.neutral }}
    >
      {rank}순위
    </span>
  );
};

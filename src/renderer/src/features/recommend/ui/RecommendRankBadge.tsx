import { font, lightTheme } from "@heddy/design-tokens";

interface RecommendRankBadgeProps {
  rank: number;
}

export const RecommendRankBadge = ({ rank }: RecommendRankBadgeProps) => {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 max-[400px]:px-1.5 ${font.caption.medium} max-[400px]:text-[0.6875rem]`}
      style={{ borderColor: lightTheme.line.neutral, color: lightTheme.label.neutral }}
    >
      {rank}순위
    </span>
  );
};

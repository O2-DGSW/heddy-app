import { font, lightTheme } from "@heddy/design-tokens";

import type { CutsAnalysisStatus } from "@/features/cuts/model/types/CutsRecord.types";

type CutsBadgeVariant = "sharing" | CutsAnalysisStatus;

interface CutsStatusBadgeProps {
  variant: CutsBadgeVariant;
}

const BADGE_STYLE_BY_VARIANT: Record<CutsBadgeVariant, { backgroundColor: string; color: string }> =
  {
    sharing: { backgroundColor: lightTheme.status.info, color: lightTheme.background.normal },
    "분석 완료": {
      backgroundColor: lightTheme.status.success,
      color: lightTheme.background.normal,
    },
    "분석 중": { backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.assistive },
    재촬영: { backgroundColor: lightTheme.status.error, color: lightTheme.background.normal },
  };

const BADGE_LABEL_BY_VARIANT: Record<CutsBadgeVariant, string> = {
  sharing: "공유중",
  "분석 완료": "분석 완료",
  "분석 중": "분석 중",
  재촬영: "재촬영",
};

export const CutsStatusBadge = ({ variant }: CutsStatusBadgeProps) => {
  const { backgroundColor, color } = BADGE_STYLE_BY_VARIANT[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 ${font.caption.semiBold}`}
      style={{ backgroundColor, color }}
    >
      {BADGE_LABEL_BY_VARIANT[variant]}
    </span>
  );
};

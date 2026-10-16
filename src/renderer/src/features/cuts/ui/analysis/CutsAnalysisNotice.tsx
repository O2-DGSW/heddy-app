import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

interface CutsAnalysisNoticeProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** 분석 결과 대신 보여 주는 안내(결과 없음, 실패, 재촬영 필요). 이유와 다음 할 일을 함께 보여 준다 */
export const CutsAnalysisNotice = ({
  title,
  description,
  actionLabel,
  onAction,
}: CutsAnalysisNoticeProps) => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center"
    role="status"
  >
    <p className={font.body.semiBold} style={{ color: lightTheme.label.neutral }}>
      {title}
    </p>
    <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        className={cn("mt-1 h-[42px] rounded-[10px] px-[20px]", font.label.semiBold)}
        onClick={onAction}
        style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
        type="button"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

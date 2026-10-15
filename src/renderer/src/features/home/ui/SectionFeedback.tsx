import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";

interface SectionFeedbackProps {
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage: string;
  actionLabel: string;
  onAction: () => void;
}
const SectionFeedback = ({
  isLoading = false,
  isError = false,
  emptyMessage,
  actionLabel,
  onAction,
}: SectionFeedbackProps) => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[172px] flex-col items-center justify-center gap-3 px-3 py-5 text-center"
  >
    <p className={cn(font.caption.medium, "break-keep text-[var(--home-muted)]")}>
      {isLoading
        ? "정보를 불러오는 중입니다."
        : isError
          ? "정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요."
          : emptyMessage}
    </p>
    {!isLoading && (
      <button
        type="button"
        onClick={onAction}
        className={cn(
          "min-h-9 rounded-md bg-[var(--home-soft)] px-3 py-2 text-[var(--home-share-text)]",
          font.caption.semiBold
        )}
      >
        {actionLabel}
      </button>
    )}
  </div>
);
export default SectionFeedback;

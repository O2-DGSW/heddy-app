import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";

interface HomeSectionSkeletonProps {
  variant: "record" | "recommendation" | "saved-style";
}

const HomeSectionSkeleton = ({ variant }: HomeSectionSkeletonProps) => {
  const message =
    variant === "recommendation"
      ? "나에게 어울리는 스타일을 찾고 있어요"
      : variant === "record"
        ? "헤어 기록을 불러오고 있어요"
        : "저장한 스타일을 불러오고 있어요";

  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">{message}</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        {variant === "recommendation" ? (
          <div className="px-4 py-1">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className="flex min-h-24 items-center gap-3 border-b border-[var(--home-line)] py-3 last:border-0"
              >
                <span className="size-16 shrink-0 rounded-2xl bg-[var(--home-line)]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="h-3 w-10 rounded bg-[var(--home-line)]" />
                  <span className="h-4 w-3/4 rounded bg-[var(--home-line)]" />
                  <span className="h-3 w-1/2 rounded bg-[var(--home-line)]" />
                </div>
                <span className="h-7 w-14 shrink-0 rounded-full bg-[var(--home-line)]" />
              </div>
            ))}
          </div>
        ) : variant === "record" ? (
          <div className="flex items-center gap-3.5 p-4">
            <span className="size-24 shrink-0 rounded-2xl bg-[var(--home-line)]" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <span className="h-3 w-1/3 rounded bg-[var(--home-line)]" />
              <span className="h-4 w-3/4 rounded bg-[var(--home-line)]" />
              <span className="h-3 w-1/2 rounded bg-[var(--home-line)]" />
              <span className="h-3 w-2/3 rounded bg-[var(--home-line)]" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-3">
            <span className="aspect-[4/3] w-full rounded-2xl bg-[var(--home-line)]" />
            <span className="my-1 h-4 w-1/3 rounded bg-[var(--home-line)]" />
          </div>
        )}
      </div>
      {variant === "recommendation" && (
        <p
          aria-hidden="true"
          className={cn(font.caption.medium, "px-4 pb-4 pt-2 text-center text-[var(--home-muted)]")}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default HomeSectionSkeleton;

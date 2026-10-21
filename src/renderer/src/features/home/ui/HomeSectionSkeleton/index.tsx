import { font } from "@heddy/design-tokens";
import { cn, Skeleton } from "@/shared";

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
      <div aria-hidden="true" className="w-full">
        {variant === "recommendation" ? (
          <div className="px-4 py-1">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className="flex min-h-24 items-center gap-3 border-b border-[var(--home-line)] py-3 last:border-0"
              >
                <Skeleton className="size-16 shrink-0 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-10 rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-7 w-14 shrink-0 rounded-full" />
              </div>
            ))}
          </div>
        ) : variant === "record" ? (
          <div className="flex items-center gap-3.5 p-4">
            <Skeleton className="size-24 shrink-0 rounded-2xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className={cn("h-[1lh] w-1/3 rounded", font.caption.medium)} />
              <Skeleton className={cn("h-[1lh] w-3/4 rounded", font.body.semiBold)} />
              <Skeleton className={cn("h-[1lh] w-1/2 rounded", font.caption.medium)} />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="my-1 h-4 w-1/3 rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSectionSkeleton;

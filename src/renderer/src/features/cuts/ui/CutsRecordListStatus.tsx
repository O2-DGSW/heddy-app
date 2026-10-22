import { font, lightTheme } from "@heddy/design-tokens";
import { cn, Skeleton } from "@/shared";

import type { CutsViewMode } from "../model/types/CutsViewMode.types";

interface CutsRecordListStatusProps {
  isError: boolean;
  viewMode?: CutsViewMode;
  errorMessage?: string;
  onRetry: () => void;
}

/** 시술기록 목록의 로딩·에러 상태 표시 (목록이 비었을 때는 CutsEmptyState가 담당한다) */
export const CutsRecordListStatus = ({
  isError,
  viewMode = "list",
  errorMessage,
  onRetry,
}: CutsRecordListStatusProps) => {
  if (!isError) {
    return (
      <div role="status" aria-busy="true" aria-label="시술기록을 불러오는 중">
        <span className="sr-only">시술기록을 불러오는 중</span>
        <div
          aria-hidden="true"
          className={cn(
            "gap-2 px-4 pb-6 max-[400px]:px-3",
            viewMode === "grid"
              ? "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))]"
              : "flex flex-col"
          )}
        >
          {Array.from({ length: viewMode === "grid" ? 4 : 3 }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.06)]",
                viewMode === "grid"
                  ? "flex-col gap-2 p-2.5 max-[400px]:gap-1.5 max-[400px]:p-2"
                  : "items-center gap-3 p-3 max-[400px]:gap-2 max-[400px]:p-2"
              )}
              style={{ backgroundColor: lightTheme.background.normal }}
            >
              <Skeleton
                className={cn(
                  "shrink-0 rounded-xl",
                  viewMode === "grid" ? "aspect-square w-full" : "size-20 max-[400px]:size-16"
                )}
              />
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-col",
                  viewMode === "grid" ? "gap-0.5" : "gap-1"
                )}
              >
                <Skeleton className={cn("h-[1lh] w-20 rounded", font.caption.medium)} />
                <Skeleton className={cn("h-[1lh] w-2/3 rounded", font.headline2.bold)} />
                <Skeleton className={cn("h-[1lh] w-4/5 rounded", font.caption.regular)} />
                {viewMode === "list" && <Skeleton className="mt-0.5 h-3.5 w-20 rounded" />}
              </div>
              {viewMode === "grid" ? (
                <Skeleton className="mt-0.5 h-3.5 w-20 rounded" />
              ) : (
                <Skeleton className="size-4 shrink-0 rounded" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
      <p
        className={`text-center ${font.label.regular}`}
        style={{ color: lightTheme.label.assistive }}
      >
        {isError ? (errorMessage ?? "시술기록을 불러오지 못했습니다.") : "시술기록을 불러오는 중"}
      </p>

      {isError && (
        <button
          type="button"
          onClick={onRetry}
          className={`rounded-full px-4 py-2 ${font.label.semiBold}`}
          style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
        >
          다시 시도
        </button>
      )}
    </div>
  );
};

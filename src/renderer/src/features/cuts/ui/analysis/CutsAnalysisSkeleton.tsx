import { font, lightTheme } from "@heddy/design-tokens";

import { cn, Skeleton } from "@/shared";

/** 사진·신뢰도·지표의 순서와 간격을 분석 결과와 맞춘다. */
export const CutsAnalysisSkeleton = () => (
  <div aria-busy="true" aria-label="분석 결과를 불러오는 중" role="status">
    <span className="sr-only">분석 결과를 불러오는 중</span>
    <div aria-hidden="true" className="flex flex-col pb-6">
      <div className="flex flex-col gap-3 px-4 pt-4">
        <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
          사진에서 확인할 것
        </h2>
        <Skeleton className="mx-auto aspect-square w-4/5 rounded-4xl" />
      </div>
      <div
        className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl p-4 shadow-[0_0_6px_rgba(0,0,0,0.07)]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className={cn("h-[1lh] w-3/4 rounded", font.headline1.bold)} />
          <Skeleton className={cn("h-[1lh] w-full rounded", font.caption.regular)} />
        </div>
        <Skeleton className="size-12 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-col gap-4 px-4 pt-6">
        <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
          상태 지표
        </h2>
        <div className="flex flex-col gap-5">
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className={cn("h-[1lh] w-24 rounded", font.body.medium)} />
                <Skeleton className={cn("h-[1lh] w-28 rounded", font.caption.regular)} />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 pt-6">
        {[0, 1, 2].map(index => (
          <Skeleton key={index} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

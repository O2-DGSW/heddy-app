import { font, lightTheme } from "@heddy/design-tokens";
import { cn, Skeleton } from "@/shared";

import { RecommendHeader } from "@/features/recommend";
import { RecommendBasisSection } from "@/features/recommend";
import { RecommendResultSection } from "@/features/recommend";
import { RecommendStatus } from "@/features/recommend";
import { useRecommendation } from "@/features/recommend";

/** 조회 후의 섹션 간격과 카드 폭을 유지해 로딩 완료 시 화면이 크게 뛰지 않게 한다. */
const RecommendSkeleton = () => (
  <div role="status" aria-busy="true" aria-label="추천을 불러오는 중">
    <span className="sr-only">추천을 불러오는 중</span>
    <div aria-hidden="true" className="flex flex-col gap-3 px-4 pt-5">
      <h2 className={font.headline1.bold} style={{ color: lightTheme.label.normal }}>
        추천 결과 Top 3
      </h2>
      {[0, 1, 2].map(index => (
        <div
          key={index}
          className="flex gap-3 rounded-2xl p-2.5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] max-[400px]:gap-2 max-[400px]:p-2"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <Skeleton className="aspect-square w-[30%] shrink-0 self-start rounded-lg max-[360px]:w-[28%]" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex gap-1.5 max-[400px]:gap-1">
              <Skeleton className={cn("h-[1lh] w-9 rounded-full", font.caption.medium)} />
              <Skeleton className={cn("h-[1lh] w-14 rounded-full", font.caption.medium)} />
              <Skeleton className={cn("h-[1lh] w-5 rounded-full", font.caption.medium)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <Skeleton className={cn("h-[1lh] w-1/2 rounded", font.headline2.bold)} />
              <Skeleton className={cn("h-[2lh] w-full rounded", font.caption.regular)} />
              {index === 0 && (
                <Skeleton className={cn("h-[1lh] w-4/5 rounded", font.caption.regular)} />
              )}
            </div>
            <Skeleton
              className={cn("mt-0.5 h-[1lh] w-full rounded-full py-1", font.caption.semiBold)}
            />
          </div>
        </div>
      ))}
    </div>
    <div aria-hidden="true" className="flex flex-col gap-3 px-4 pb-6 pt-6">
      <h2 className={font.headline1.bold} style={{ color: lightTheme.label.normal }}>
        추천 근거 데이터
      </h2>
      <div
        className="rounded-2xl px-4 py-1 shadow-[0_1px_6px_rgba(0,0,0,0.06)]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        {[0, 1, 2, 3, 4].map(index => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
            style={{ borderColor: lightTheme.line.alternative }}
          >
            <Skeleton className={cn("h-[1lh] w-24 rounded", font.label.regular)} />
            <Skeleton className={cn("h-[1lh] w-28 rounded", font.label.semiBold)} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const RecommendPage = () => {
  const {
    items,
    basisRows,
    isEmpty,
    isPending,
    isError,
    error,
    refetch,
    isRefetching,
    generate,
    isGenerating,
    generateError,
  } = useRecommendation();

  return (
    <cap-page>
      <section
        aria-labelledby="recommend-title"
        className="flex h-full flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <RecommendHeader />
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-none no-scrollbar [-webkit-overflow-scrolling:touch]">
          {isPending && <RecommendSkeleton />}

          {isError && (
            <RecommendStatus
              hasIllustration
              message={error?.message ?? "추천을 불러오지 못했습니다."}
              actionLabel="다시 시도"
              isActionPending={isRefetching}
              onAction={() => void refetch()}
            />
          )}

          {isEmpty && (
            <RecommendStatus
              hasIllustration
              message={
                generateError
                  ? generateError.message
                  : "아직 추천이 없어요\n시술기록을 바탕으로 추천을 만들어 드릴게요"
              }
              actionLabel="추천 받기"
              isActionPending={isGenerating}
              onAction={generate}
            />
          )}

          {items.length > 0 && <RecommendResultSection recommendations={items} />}

          {/* 근거 데이터는 추천 결과가 있을 때만 의미가 있어, 목록이 비면 함께 숨긴다 */}
          {items.length > 0 && basisRows.length > 0 && <RecommendBasisSection rows={basisRows} />}
        </div>
      </section>
    </cap-page>
  );
};

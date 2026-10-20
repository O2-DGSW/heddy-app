import { Skeleton } from "@/shared";

/**
 * 결과를 불러오는 동안 같은 자리에 같은 크기의 블록을 깔아 둔다.
 * 문구만 띄우면 결과가 들어올 때 화면이 통째로 바뀌어 더 오래 기다린 것처럼 느껴진다.
 */
export const CutsAnalysisSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="분석 결과를 불러오는 중"
    className="flex flex-col gap-4 px-4 pb-6 pt-6"
    role="status"
  >
    <Skeleton className="mx-auto aspect-square w-4/5 rounded-4xl" />
    <Skeleton className="h-[96px] rounded-2xl" />
    {[0, 1, 2, 3].map(index => (
      <Skeleton className="h-[44px] rounded-xl" key={index} />
    ))}
  </div>
);

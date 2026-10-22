import { lightTheme } from "@heddy/design-tokens";

import cn from "../../lib/cn";
import Skeleton from "../skeleton";
import ProfileSkeleton from "./ProfileSkeleton";

export {
  default as ProfileSummarySkeleton,
  PROFILE_SUMMARY_BACKGROUND,
} from "./ProfileSummarySkeleton";

export type PageSkeletonVariantType =
  "records" | "recommend" | "detail" | "profile" | "form" | "ar";

interface PageSkeletonProps {
  variant?: PageSkeletonVariantType;
  label?: string;
  compact?: boolean;
}

/** 라우트 코드와 서버 응답을 기다리는 동안 실제 화면과 비슷한 공간을 확보한다. */
const PageSkeleton = ({
  variant = "form",
  label = "불러오는 중",
  compact = false,
}: PageSkeletonProps) =>
  variant === "profile" ? (
    <ProfileSkeleton label={label} />
  ) : (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="flex w-full flex-col gap-6 px-5 py-6"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <span className="sr-only">{label}</span>
      {!compact && <Skeleton className="h-7 w-28 rounded" />}
      {(variant === "detail" || variant === "ar") && (
        <Skeleton className="mx-auto aspect-square w-4/5 rounded-4xl" />
      )}
      {variant === "records" && !compact && <Skeleton className="h-9 w-4/5 rounded-full" />}
      <div className="flex flex-col gap-4">
        {Array.from({ length: compact ? 2 : 3 }, (_, index) => (
          <div key={index} className="flex gap-4 rounded-2xl py-2">
            {(variant === "records" || variant === "recommend") && (
              <Skeleton
                className={cn(
                  "size-20 shrink-0",
                  variant === "records" ? "rounded-xl" : "rounded-lg"
                )}
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
              {variant === "form" && <Skeleton className="mt-1 h-11 w-full rounded-[15px]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

export default PageSkeleton;

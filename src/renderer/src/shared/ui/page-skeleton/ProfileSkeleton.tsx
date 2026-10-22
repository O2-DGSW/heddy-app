import { font, lightTheme } from "@heddy/design-tokens";

import cn from "../../lib/cn";
import Skeleton from "../skeleton";
import ProfileSummarySkeleton from "./ProfileSummarySkeleton";

interface ProfileSkeletonProps {
  label: string;
}

/** 프로필·요약·설정·하단 두 버튼을 실제 화면과 같은 크기와 위치로 미리 잡는다. */
const ProfileSkeleton = ({ label }: ProfileSkeletonProps) => (
  <div
    role="status"
    aria-busy="true"
    aria-label={label}
    className="flex h-full w-full flex-col overflow-y-auto overscroll-contain no-scrollbar"
    style={{ backgroundColor: lightTheme.fill.normal }}
  >
    <span className="sr-only">{label}</span>
    <div style={{ backgroundColor: lightTheme.background.normal }}>
      <div className="mx-auto flex w-full max-w-[402px] flex-col gap-[28px] px-[clamp(16px,6.47vw,26px)] pb-[25px] pt-[22px]">
        <div className="flex items-center gap-[20px]">
          <Skeleton className="size-[68px] shrink-0 rounded-full" />
          <Skeleton className="h-7 w-36 min-w-0 rounded" />
        </div>
        <ProfileSummarySkeleton />
      </div>
    </div>
    <div className="flex flex-1 justify-center px-[clamp(16px,5.47vw,22px)] py-[clamp(24px,9.2vw,37px)]">
      <div
        className="flex min-h-[410px] w-full max-w-[349px] flex-col items-center justify-between rounded-[15px] px-[clamp(16px,5.47vw,22px)] py-[19px] shadow-[0_0_6px_rgba(0,0,0,0.02)]"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <div className="flex w-full max-w-[300px] flex-col gap-[24px]">
          <Skeleton className={cn("h-[1lh] w-10 rounded", font.headline1.semiBold)} />
          <div className="flex flex-col gap-[36px]">
            {["w-32", "w-24", "w-28"].map(width => (
              <div className="flex h-[21px] items-center justify-between" key={width}>
                <div className="flex min-w-0 items-center gap-[8px]">
                  <Skeleton className="size-[18px] shrink-0 rounded" />
                  <Skeleton className={cn("h-[1lh] min-w-0 rounded", width, font.body.medium)} />
                </div>
                <Skeleton className="size-[14px] shrink-0 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid w-full max-w-[300px] grid-cols-2 gap-[6px]">
          <Skeleton className="h-[30px] w-full rounded-[5px]" />
          <Skeleton className="h-[30px] w-full rounded-[5px]" />
        </div>
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;

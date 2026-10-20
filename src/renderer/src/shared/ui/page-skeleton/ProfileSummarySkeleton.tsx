import { font, lightTheme } from "@heddy/design-tokens";

import cn from "../../lib/cn";
import Skeleton from "../skeleton";

export const PROFILE_SUMMARY_BACKGROUND = `color-mix(in srgb, ${lightTheme.primary.normal} 6%, ${lightTheme.background.normal})`;

/** 요약 카드 배경은 유지하고 숫자와 설명 자리만 가린다. */
const ProfileSummarySkeleton = () => (
  <div
    aria-hidden="true"
    className="grid h-[87px] w-full grid-cols-2 place-items-center rounded-[15px]"
    style={{ backgroundColor: PROFILE_SUMMARY_BACKGROUND }}
  >
    {[0, 1].map(index => (
      <div className="flex min-w-0 flex-col items-center gap-[4px]" key={index}>
        <Skeleton className={cn("h-[1lh] w-10 rounded", font.headline1.medium)} />
        <Skeleton className={cn("h-[1lh] w-14 rounded", font.label.medium)} />
      </div>
    ))}
  </div>
);

export default ProfileSummarySkeleton;

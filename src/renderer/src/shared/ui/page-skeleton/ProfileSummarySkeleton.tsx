import { font, lightTheme } from "@heddy/design-tokens";

import cn from "../../lib/cn";
import Skeleton from "../skeleton";

export const PROFILE_SUMMARY_BACKGROUND = `color-mix(in srgb, ${lightTheme.primary.normal} 6%, ${lightTheme.background.normal})`;

/** 고정된 항목명은 유지하고 서버에서 받는 숫자 자리만 가린다. */
const ProfileSummarySkeleton = () => (
  <div
    className="grid h-[87px] w-full grid-cols-2 place-items-center rounded-[15px]"
    style={{ backgroundColor: PROFILE_SUMMARY_BACKGROUND }}
  >
    {["시술 기록", "공유 중"].map(label => (
      <div className="flex min-w-0 flex-col items-center gap-[4px]" key={label}>
        <span className={cn("flex items-center gap-[2px]", font.headline1.medium)}>
          <Skeleton className="h-[1lh] w-6 rounded" />
          <span style={{ color: lightTheme.label.alternative }}>건</span>
        </span>
        <span
          className={cn("whitespace-nowrap text-center", font.label.medium)}
          style={{ color: lightTheme.label.assistive }}
        >
          {label}
        </span>
      </div>
    ))}
  </div>
);

export default ProfileSummarySkeleton;

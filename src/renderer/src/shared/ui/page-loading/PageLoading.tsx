import { font, lightTheme } from "@heddy/design-tokens";
import { useEffect, useState } from "react";

import { cn } from "@/shared/lib";

interface PageLoadingProps {
  /** 이 시간 안에 끝나면 아무것도 그리지 않는다. 금방 끝나는 확인에서 로딩이 깜빡이지 않게 한다 */
  delayMs?: number;
  label?: string;
}

const DEFAULT_DELAY_MS = 300;

/** 화면 전체를 기다릴 때(인증 확인 등) 빈 화면 대신 보여 주는 로딩 표시 */
export const PageLoading = ({
  delayMs = DEFAULT_DELAY_MS,
  label = "불러오는 중",
}: PageLoadingProps) => {
  const [isVisible, setIsVisible] = useState(delayMs === 0);

  useEffect(() => {
    if (delayMs === 0) {
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(true), delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="flex h-full min-h-[200px] flex-1 flex-col items-center justify-center gap-[12px]"
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-[28px] w-[28px] animate-spin rounded-full border-[3px] motion-reduce:animate-none"
        style={{
          borderColor: lightTheme.fill.neutral,
          borderTopColor: lightTheme.primary.normal,
        }}
      />
      <span className={cn(font.label.medium)} style={{ color: lightTheme.label.assistive }}>
        {label}
      </span>
    </div>
  );
};

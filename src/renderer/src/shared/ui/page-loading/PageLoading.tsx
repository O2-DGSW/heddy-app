import { useEffect, useState } from "react";

import PageSkeleton from "../page-skeleton";

interface PageLoadingProps {
  /** 이 시간 안에 끝나면 아무것도 그리지 않는다. 금방 끝나는 확인에서 로딩이 깜빡이지 않게 한다 */
  delayMs?: number;
  label?: string;
}

const DEFAULT_DELAY_MS = 120;

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

  return <PageSkeleton label={label} />;
};

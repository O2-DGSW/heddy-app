import { useEffect, useRef } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

interface CutsLoadMoreTriggerProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** 목록 아래 끝을 감지해 다음 페이지를 이어서 불러온다 */
export const CutsLoadMoreTrigger = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: CutsLoadMoreTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerElement = triggerRef.current;

    if (!triggerElement || !hasNextPage) {
      return;
    }

    // 끝에 닿기 전에 미리 불러와야 스크롤이 끊기지 않는다.
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(triggerElement);

    return () => observer.disconnect();
  }, [hasNextPage, onLoadMore]);

  if (!hasNextPage) {
    return null;
  }

  return (
    // shrink-0이 없으면 flex 컨테이너 안에서 높이가 0으로 찌그러져 감지가 안 된다.
    <div ref={triggerRef} className="flex h-10 shrink-0 items-center justify-center">
      {isFetchingNextPage && (
        <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
          불러오는 중
        </span>
      )}
    </div>
  );
};

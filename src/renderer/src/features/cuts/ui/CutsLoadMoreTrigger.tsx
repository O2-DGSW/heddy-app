import { useEffect, useRef } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

interface CutsLoadMoreTriggerProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** 가장 가까운 스크롤 컨테이너. 페이지가 자기 영역 안에서 스크롤하므로 viewport가 아니라 이것을 기준으로 감지한다 */
const getScrollParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);

    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
};

/** 목록 아래 끝을 감지해 다음 페이지를 이어서 불러온다 */
export const CutsLoadMoreTrigger = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: CutsLoadMoreTriggerProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerElement = triggerRef.current;

    // 불러오는 중에는 감지하지 않는다. 끝나면 다시 붙어서, 아직 끝이 보이면 바로 다음 페이지를 부른다.
    if (!triggerElement || !hasNextPage || isFetchingNextPage) {
      return;
    }

    // 끝에 닿기 전에 미리 불러와야 스크롤이 끊기지 않는다.
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          onLoadMore();
        }
      },
      { root: getScrollParent(triggerElement), rootMargin: "200px" }
    );

    observer.observe(triggerElement);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

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

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import type { ArHairstyleOption } from "@/entities/ar-groom";
import { showInfoToast } from "@/shared";

/** 목록 비동기 로딩과 캐시된 페이지 재진입 모두 지원하며, 진입당 한 번만 적용한다. */
export const useRequestedArGroom = (
  options: ArHairstyleOption[],
  isPending: boolean,
  selectHairstyle: (name: string) => void
) => {
  const location = useLocation();
  const appliedEntry = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname !== "/ar" || isPending) return;
    const entry = `${location.key}:${location.search}`;
    if (appliedEntry.current === entry) return;
    appliedEntry.current = entry;
    const requested = new URLSearchParams(location.search).get("groom");
    if (!requested) return;
    if (!options.some(option => option.name === requested)) {
      selectHairstyle("");
      showInfoToast("추천한 스타일을 현재 AR에서 불러올 수 없어요. 다른 스타일을 선택해 주세요.");
      return;
    }
    selectHairstyle(requested);
  }, [location.key, location.pathname, location.search, isPending, options, selectHairstyle]);
};

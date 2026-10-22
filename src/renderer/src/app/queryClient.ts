import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { focusManager, QueryClient } from "@tanstack/react-query";
import { getHttpStatus } from "@heddy/api";

import { createRecommendationMutationCache } from "./recommendationInvalidation";

const MAX_QUERY_RETRY_COUNT = 2;
/** 화면을 오갈 때마다 같은 데이터를 다시 받지 않도록 30초 동안은 캐시를 그대로 쓴다 */
const DEFAULT_STALE_TIME_MS = 30_000;

// 네이티브 WebView는 앱을 백그라운드에 보냈다 돌아와도 focus 이벤트가 오지 않을 수 있다.
// 앱 활성 상태를 포커스로 알려, 돌아왔을 때 오래된 데이터를 다시 받게 한다.
if (Capacitor.isNativePlatform()) {
  focusManager.setEventListener(handleFocus => {
    const listener = App.addListener("appStateChange", ({ isActive }) => handleFocus(isActive));

    return () => {
      void listener.then(handle => handle.remove());
    };
  });
}

/**
 * 인증 실패·권한 없음·잘못된 요청(4xx)은 다시 보내도 결과가 같아 재시도하지 않는다.
 * 재시도하면 에러 화면이 뜨기까지 사용자만 몇 초를 더 기다리게 된다.
 */
const shouldRetryQuery = (failureCount: number, error: Error) => {
  const status = getHttpStatus(error);

  if (status && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < MAX_QUERY_RETRY_COUNT;
};

export const queryClient: QueryClient = new QueryClient({
  mutationCache: createRecommendationMutationCache(() => queryClient),
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      staleTime: DEFAULT_STALE_TIME_MS,
    },
  },
});

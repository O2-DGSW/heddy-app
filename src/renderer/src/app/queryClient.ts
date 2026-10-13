import { QueryClient } from "@tanstack/react-query";
import { getHttpStatus } from "@heddy/api";

const MAX_QUERY_RETRY_COUNT = 2;

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
    },
  },
});

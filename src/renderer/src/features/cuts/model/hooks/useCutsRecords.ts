import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getTreatmentRecordsApi, recordQueryKeys } from "@/entities";
import { mapTreatmentRecordToCutsRecord } from "@/features/cuts/model/mapTreatmentRecord";
import type { ServiceType, TreatmentRecordListParams } from "@/entities";

const PAGE_SIZE = 20;
const FIRST_PAGE = 0;

interface UseCutsRecordsOptions {
  /** 카테고리 필터. 값을 주면 서버가 해당 시술 종류만 걸러서 내려준다 */
  serviceType?: ServiceType;
}

/**
 * 시술기록 목록을 페이지 단위로 불러와 카드에서 쓰는 형태로 변환해 돌려준다.
 * 화면을 아래로 내리면 다음 페이지를 이어 붙이는 방식이라 페이지 번호는 훅이 관리한다.
 */
export const useCutsRecords = ({ serviceType }: UseCutsRecordsOptions = {}) => {
  const listParams = useMemo(
    (): Omit<TreatmentRecordListParams, "page"> => ({
      ...(serviceType ? { service_type: serviceType } : {}),
      size: PAGE_SIZE,
      sort: "performedAt,desc",
    }),
    [serviceType]
  );
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // 필터가 바뀌면 서버에 다시 물어야 하므로 키에 함께 넣는다.
    queryKey: recordQueryKeys.list(listParams),
    queryFn: ({ pageParam }) =>
      getTreatmentRecordsApi({
        ...listParams,
        page: pageParam,
      }),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: lastPage => (lastPage.page?.has_next ? lastPage.page.number + 1 : undefined),
  });

  const records = useMemo(
    () => (data?.pages ?? []).flatMap(page => page.items.map(mapTreatmentRecordToCutsRecord)),
    [data?.pages]
  );

  return {
    records,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

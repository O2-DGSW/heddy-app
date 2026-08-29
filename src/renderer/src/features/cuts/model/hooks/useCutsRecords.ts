import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getTreatmentRecordsApi } from "@/entities";
import type { TreatmentRecordListParams } from "@/entities";
import { mapTreatmentRecordToCutsRecord } from "@/features/cuts/model/mapTreatmentRecord";

export const CUTS_RECORDS_QUERY_KEY = "cuts-records";

/** 목록 첫 페이지 조회 기준. 페이지네이션은 아직 화면에 붙이지 않았다. */
const DEFAULT_LIST_PARAMS: TreatmentRecordListParams = {
  page: 0,
  size: 20,
  sort: "performedAt,desc",
};

/** 시술기록 목록을 불러와 카드에서 쓰는 형태로 변환해 돌려준다 */
export const useCutsRecords = () => {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [CUTS_RECORDS_QUERY_KEY, DEFAULT_LIST_PARAMS],
    queryFn: () => getTreatmentRecordsApi(DEFAULT_LIST_PARAMS),
  });

  const records = useMemo(
    () => (data?.items ?? []).map(mapTreatmentRecordToCutsRecord),
    [data?.items]
  );

  return {
    records,
    page: data?.page,
    isPending,
    isError,
    error,
    refetch,
  };
};

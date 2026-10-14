import { queryOptions, skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { getTreatmentRecordApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "./recordQueryKeys";

const getTreatmentRecordQueryOptions = (recordId: string | undefined) =>
  queryOptions({
    queryKey: recordQueryKeys.detail(recordId ?? ""),
    queryFn: recordId ? () => getTreatmentRecordApi(recordId) : skipToken,
  });

export const useGetTreatmentRecord = (recordId: string | undefined) =>
  useQuery(getTreatmentRecordQueryOptions(recordId));

/** 목록에서 기록을 누르면 상세 화면을 그리기 전에 미리 받아 둔다 */
export const usePrefetchTreatmentRecord = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (recordId: string) => {
      void queryClient.prefetchQuery(getTreatmentRecordQueryOptions(recordId));
    },
    [queryClient]
  );
};

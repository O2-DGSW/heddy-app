import { useQuery } from "@tanstack/react-query";

import { getTreatmentRecordApi } from "../treatmentRecordApi";
import { recordQueryKeys } from "./recordQueryKeys";

export const useGetTreatmentRecord = (recordId: string | undefined) =>
  useQuery({
    queryKey: recordQueryKeys.detail(recordId ?? ""),
    queryFn: () => getTreatmentRecordApi(recordId ?? ""),
    enabled: Boolean(recordId),
  });

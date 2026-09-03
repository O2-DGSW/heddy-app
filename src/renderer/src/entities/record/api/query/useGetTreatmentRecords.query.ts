import { useQuery } from "@tanstack/react-query";

import { getTreatmentRecordsApi } from "@/entities";
import { recordQueryKeys } from "@/entities";
import type { TreatmentRecordListParams } from "@/entities/record/model/treatmentRecord.types";

export const useGetTreatmentRecords = (params: TreatmentRecordListParams = {}) =>
  useQuery({
    queryKey: recordQueryKeys.list(params),
    queryFn: () => getTreatmentRecordsApi(params),
  });

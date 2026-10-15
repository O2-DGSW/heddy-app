import { useQuery } from "@tanstack/react-query";

import { getLatestAnalysisApi } from "../analysisApi";
import { recordQueryKeys } from "./recordQueryKeys";

export const useGetLatestAnalysis = (recordId: string | undefined) =>
  useQuery({
    queryKey: recordQueryKeys.latestAnalysis(recordId ?? ""),
    queryFn: () => getLatestAnalysisApi(recordId ?? ""),
    enabled: Boolean(recordId),
  });

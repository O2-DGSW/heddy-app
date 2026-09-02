import { useQuery } from "@tanstack/react-query";

import { getLatestRecommendationApi } from "@/entities";
import { recommendationQueryKeys } from "@/entities";

export const useGetLatestRecommendation = () =>
  useQuery({
    queryKey: recommendationQueryKeys.latest(),
    queryFn: getLatestRecommendationApi,
  });

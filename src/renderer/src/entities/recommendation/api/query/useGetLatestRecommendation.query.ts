import { useQuery } from "@tanstack/react-query";

import { getLatestRecommendationApi } from "../recommendationApi";
import { recommendationQueryKeys } from "./recommendationQueryKeys";

export const useGetLatestRecommendation = () =>
  useQuery({
    queryKey: recommendationQueryKeys.latest(),
    queryFn: getLatestRecommendationApi,
  });

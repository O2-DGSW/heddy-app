import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { generateRecommendationApi, getLatestRecommendationApi } from "@/entities";
import { mapRecommendationToItems } from "@/features/recommend/model/mapRecommendation";

export const LATEST_RECOMMENDATION_QUERY_KEY = "latest-recommendation";

/**
 * 화면에 보여줄 추천을 관리한다.
 * - 진입 시에는 조회만 하는 최신 추천(GET)을 부른다.
 * - 새 추천 생성(POST)은 결과를 새로 만드는 요청이라 사용자가 눌렀을 때만 부른다.
 */
export const useRecommendation = () => {
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [LATEST_RECOMMENDATION_QUERY_KEY],
    queryFn: getLatestRecommendationApi,
  });

  const generate = useMutation({
    mutationFn: () => generateRecommendationApi({ force_refresh: true }),
    onSuccess: generated => {
      // 생성 결과가 곧 최신 추천이므로 다시 받아오지 않고 캐시에 바로 반영한다.
      queryClient.setQueryData([LATEST_RECOMMENDATION_QUERY_KEY], generated);
    },
  });

  const items = useMemo(() => mapRecommendationToItems(data ?? null), [data]);

  return {
    items,
    /** 추천을 한 번도 만든 적이 없는 상태 */
    isEmpty: !isPending && !isError && items.length === 0,
    generatedAt: data?.generated_at ?? null,
    isPending,
    isError,
    error,
    refetch,
    generate: generate.mutate,
    isGenerating: generate.isPending,
    generateError: generate.error,
  };
};

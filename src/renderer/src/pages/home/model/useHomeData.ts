import { useIsMutating } from "@tanstack/react-query";
import { useGetMyProfile } from "@/entities/profile";
import { recommendationQueryKeys, useGetLatestRecommendation } from "@/entities/recommendation";
import { useGetTreatmentRecords } from "@/entities/record";
import { useGetSavedStyles } from "@/entities/saved-style";
import type { SavedStyleResponse } from "@/entities/saved-style";
import type { ArStyleType } from "@/features/home";

import { HOME_RECENT_RECORD_PARAMS } from "./constants";
import { mapRecommendationToHomeCards } from "./mapRecommendationToHomeCards";
import { mapTreatmentRecordToRecentRecord } from "./mapTreatmentRecordToRecentRecord";

// 저장 순서를 유지하며 이미지가 없는 스타일도 빈 이미지 안내와 함께 표시한다.
const mapSavedStylesToArStyles = (items: SavedStyleResponse[]): ArStyleType[] =>
  items.map(item => ({
    id: item.saved_style_id,
    name: item.style_name,
    imageUrl: item.image_url ?? "",
  }));

/** 홈 화면 섹션별 데이터. 섹션마다 따로 불러와 하나가 실패해도 나머지는 보여준다 */
export const useHomeData = () => {
  const profile = useGetMyProfile();
  const records = useGetTreatmentRecords(HOME_RECENT_RECORD_PARAMS);
  const recommendation = useGetLatestRecommendation();
  const savedStyles = useGetSavedStyles();
  const isGeneratingRecommendation =
    useIsMutating({ mutationKey: recommendationQueryKeys.all }) > 0;

  const recentItem = records.data?.items[0];

  return {
    profileName: profile.data?.nickname ?? "",
    recentRecord: {
      data: recentItem ? mapTreatmentRecordToRecentRecord(recentItem) : null,
      isLoading: records.isPending,
      isError: records.isError,
      refetch: records.refetch,
    },
    arStyles: {
      data: mapSavedStylesToArStyles(savedStyles.data?.items ?? []),
      isLoading: savedStyles.isPending,
      isError: savedStyles.isError,
      refetch: savedStyles.refetch,
    },
    recommendations: {
      data: mapRecommendationToHomeCards(recommendation.data ?? null),
      isLoading:
        recommendation.isPending ||
        (!recommendation.data?.items.length &&
          (recommendation.isFetching || isGeneratingRecommendation)),
      isRefreshing: recommendation.isFetching || isGeneratingRecommendation,
      isGenerating: isGeneratingRecommendation,
      isError: recommendation.isError,
      refetch: recommendation.refetch,
    },
  };
};

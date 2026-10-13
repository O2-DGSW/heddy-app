import { useGetMyProfile } from "@/entities/profile";
import { useGetLatestRecommendation } from "@/entities/recommendation";
import { useGetTreatmentRecords } from "@/entities/record";
import { useGetSavedStyles } from "@/entities/saved-style";
import type { SavedStyleResponse } from "@/entities/saved-style";
import type { ArStyleType } from "@/features/home";

import { HOME_RECENT_RECORD_PARAMS } from "./constants";
import { mapRecommendationToHomeCards } from "./mapRecommendationToHomeCards";
import { mapTreatmentRecordToRecentRecord } from "./mapTreatmentRecordToRecentRecord";

const MAX_HOME_AR_STYLE_COUNT = 3;

// AR로 체험하고 저장한 후보 스타일 중 이미지가 있는 것만 홈에 보여준다
const mapSavedStylesToArStyles = (items: SavedStyleResponse[]): ArStyleType[] =>
  items
    .filter(item => Boolean(item.image_url))
    .slice(0, MAX_HOME_AR_STYLE_COUNT)
    .map(item => ({
      id: item.saved_style_id,
      name: item.style_name,
      imageUrl: item.image_url ?? "",
    }));

/** 홈 화면 섹션별 데이터. 섹션마다 따로 불러와 하나가 실패해도 나머지는 보여준다 */
export const useHomeData = () => {
  const profile = useGetMyProfile();
  const records = useGetTreatmentRecords({ ...HOME_RECENT_RECORD_PARAMS, page: 0, size: 1 });
  const recommendation = useGetLatestRecommendation();
  const savedStyles = useGetSavedStyles();

  const recentItem = records.data?.items[0];

  return {
    profileName: profile.data?.nickname ?? "",
    recentRecord: {
      data: recentItem ? mapTreatmentRecordToRecentRecord(recentItem) : null,
      isLoading: records.isPending,
      isError: records.isError,
    },
    arStyles: {
      data: mapSavedStylesToArStyles(savedStyles.data?.items ?? []),
      isLoading: savedStyles.isPending,
      isError: savedStyles.isError,
    },
    recommendations: {
      data: mapRecommendationToHomeCards(recommendation.data ?? null),
      isLoading: recommendation.isPending,
      isError: recommendation.isError,
    },
  };
};

import { useMemo } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { HOME_RECENT_RECORD_PARAMS, SHORTCUT_CARDS } from "../model/constants";
import { mapRecommendationToHomeCards } from "../model/mapRecommendationToHomeCards";
import { mapTreatmentRecordToRecentRecord } from "../model/mapTreatmentRecordToRecentRecord";

import { useGetLatestRecommendation, useGetMyProfile, useGetTreatmentRecords } from "@/entities";
import HomeHeader from "@/features/home/ui/HomeHeader.tsx";
import RecentRecordCard from "@/features/home/ui/RecentRecordCard.tsx";
import RecommendationSection from "@/features/home/ui/RecommendationSection.tsx";
import ShortcutCard from "@/features/home/ui/ShortcutCard.tsx";

const HomePage = () => {
  const navigate = useNavigate();
  const {
    data: recentRecordData,
    isPending: isRecentRecordPending,
    isError: isRecentRecordError,
    refetch: refetchRecentRecord,
  } = useGetTreatmentRecords(HOME_RECENT_RECORD_PARAMS);
  const {
    data: recommendationData,
    isPending: isRecommendationPending,
    isError: isRecommendationError,
  } = useGetLatestRecommendation();
  const { data: profile } = useGetMyProfile();
  const recommendations = useMemo(
    () => mapRecommendationToHomeCards(recommendationData ?? null),
    [recommendationData]
  );
  const recentRecord = recentRecordData?.items[0]
    ? mapTreatmentRecordToRecentRecord(recentRecordData.items[0])
    : undefined;
  const profileName = profile?.nickname?.trim() || "고객";

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  const handleRecentRecordClick = () => {
    if (isRecentRecordError) {
      void refetchRecentRecord();
      return;
    }

    navigate(recentRecord ? `/cuts/${recentRecord.id}` : "/cuts/add");
  };

  return (
    <cap-page>
      <section
        aria-labelledby="home-greeting"
        className="flex h-full min-h-0 flex-col overflow-hidden"
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <HomeHeader onProfileClick={() => handleNavigate("/profile")} />

        <div className="mx-auto mt-[clamp(16px,2.9svh,24px)] w-[calc(100%_-_42px)] max-w-[360px]">
          <h1
            id="home-greeting"
            className={font.title2.bold}
            style={{ color: lightTheme.label.neutral }}
          >
            {profileName}님, 안녕하세요
          </h1>
          <p className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
            시술 기록을 저장하고, 스타일을 추천받으세요
          </p>
        </div>

        <div className="mx-auto mt-[clamp(18px,3.8svh,32px)] grid h-[clamp(168px,27svh,228px)] w-[calc(100%_-_42px)] max-w-[360px] grid-cols-[minmax(0,1.041fr)_minmax(0,1fr)] gap-[clamp(8px,2.8vw,12px)]">
          <RecentRecordCard
            record={recentRecord}
            isLoading={isRecentRecordPending}
            isError={isRecentRecordError}
            onClick={handleRecentRecordClick}
          />

          <div className="grid min-h-0 grid-rows-2 gap-[clamp(6px,1.1svh,8px)]">
            {SHORTCUT_CARDS.map(card => (
              <ShortcutCard key={card.id} card={card} onClick={() => handleNavigate(card.to)} />
            ))}
          </div>
        </div>

        <RecommendationSection
          recommendations={recommendations}
          isLoading={isRecommendationPending}
          isError={isRecommendationError}
          onMoreClick={() => handleNavigate("/recommend")}
          onRecommendationClick={() => handleNavigate("/recommend")}
        />
      </section>
    </cap-page>
  );
};

export default HomePage;

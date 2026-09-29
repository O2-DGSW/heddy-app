import { useMemo } from "react";
import { font } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { HOME_RECENT_RECORD_PARAMS } from "../model/constants";
import { mapTreatmentRecordToRecentRecord } from "../model/mapTreatmentRecordToRecentRecord";

import { useGetTreatmentRecords } from "@/entities";
import { cn } from "@/shared";
import {
  ArStyleSection,
  HOME_AR_STYLES,
  HOME_PROFILE_NAME,
  HOME_RECOMMENDATIONS,
  HomeHeader,
  RecentRecordCard,
  RecommendationSection,
  ShareRecordBanner,
  homeTheme,
} from "@/features/home";

const HomePage = () => {
  const navigate = useNavigate();
  const {
    data: treatmentRecordList,
    isPending: isRecentRecordPending,
    isError: isRecentRecordError,
    refetch: refetchRecentRecord,
  } = useGetTreatmentRecords(HOME_RECENT_RECORD_PARAMS);
  const recentRecord = useMemo(() => {
    const latestRecord = treatmentRecordList?.items[0];

    return latestRecord ? mapTreatmentRecordToRecentRecord(latestRecord) : null;
  }, [treatmentRecordList]);
  const hasRecentRecord = isRecentRecordPending || Boolean(recentRecord);

  const handleRecentRecordListClick = () => {
    if (isRecentRecordError) {
      void refetchRecentRecord();
      return;
    }

    navigate("/cuts");
  };

  return (
    <cap-page>
      <section
        aria-labelledby="home-greeting"
        style={homeTheme}
        className="h-full [overflow-wrap:anywhere] overflow-y-auto overscroll-contain no-scrollbar bg-[var(--home-background)] text-[var(--home-text)]"
      >
        <div className="mx-auto w-full max-w-[532px] px-[clamp(16px,6.47vw,26px)] pt-1 pb-6">
          <HomeHeader onProfileClick={() => navigate("/profile")} />
          <div className="mt-5 mb-6 flex flex-col gap-1">
            <h1 id="home-greeting" className={font.headline1.bold}>
              {HOME_PROFILE_NAME}님, 오늘도 예쁜 하루 되세요!
            </h1>
            <p className={cn(font.label.medium, "text-[var(--home-muted)]")}>
              시술 기록을 저장하고, 스타일을 추천받으세요
            </p>
          </div>
          <RecentRecordCard
            record={recentRecord}
            isLoading={isRecentRecordPending}
            isError={isRecentRecordError}
            onAddClick={() => navigate("/cuts/add")}
            onClick={handleRecentRecordListClick}
          />
          <div className="mt-6 grid grid-cols-[minmax(0,1.126fr)_minmax(0,1fr)] gap-[14px] max-[374px]:grid-cols-1">
            <ArStyleSection
              styles={HOME_AR_STYLES}
              onMoreClick={() => navigate("/ar")}
              onTryClick={() => navigate("/ar")}
            />
            <RecommendationSection
              recommendations={HOME_RECOMMENDATIONS}
              onMoreClick={() => navigate("/recommend")}
              onRecommendationClick={() => navigate("/recommend")}
            />
          </div>
          <div className="mt-6">
            <ShareRecordBanner
              hasRecord={hasRecentRecord}
              onClick={() => navigate(hasRecentRecord ? "/cuts" : "/cuts/add")}
            />
          </div>
        </div>
      </section>
    </cap-page>
  );
};
export default HomePage;

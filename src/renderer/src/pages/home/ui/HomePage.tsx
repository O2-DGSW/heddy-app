import { useNavigate } from "react-router-dom";
import {
  ArStyleSection,
  ShareRecordBanner,
  HomeHeader,
  RecentRecordCard,
  RecommendationSection,
  homeTheme,
} from "@/features/home";

import { useHomeData } from "../model/useHomeData";

const HomePage = () => {
  const navigate = useNavigate();
  const { profileName, recentRecord, arStyles, recommendations } = useHomeData();
  const hasRecentRecord = recentRecord.isLoading || Boolean(recentRecord.data);
  const showSavedStyles = arStyles.isLoading || arStyles.isError || arStyles.data.length > 0;

  const handleRecentRecordListClick = () => {
    if (recentRecord.isError) {
      void recentRecord.refetch();
      return;
    }
    navigate("/cuts");
  };

  const handleRecommendationClick = () => {
    if (recommendations.isError) {
      void recommendations.refetch();
      return;
    }
    navigate("/recommend");
  };

  return (
    <cap-page>
      <section
        aria-labelledby="home-greeting"
        style={homeTheme}
        className="h-full [overflow-wrap:anywhere] overflow-y-auto overscroll-contain no-scrollbar bg-[var(--home-surface)] text-[var(--home-text)]"
      >
        <div className="mx-auto w-full max-w-[532px] px-[clamp(16px,5vw,24px)] pb-8 pt-2">
          <HomeHeader
            profileName={profileName}
            onProfileClick={() => navigate("/profile")}
            onArClick={() => navigate("/ar")}
          />
          <div className="mt-7">
            <RecentRecordCard
              record={recentRecord.data}
              isLoading={recentRecord.isLoading}
              isError={recentRecord.isError}
              onAddClick={() => navigate("/cuts/add")}
              onClick={handleRecentRecordListClick}
            />
          </div>
          <div className="mt-7">
            <RecommendationSection
              recommendations={recommendations.data}
              isLoading={recommendations.isLoading}
              isError={recommendations.isError}
              onMoreClick={handleRecommendationClick}
              onRecommendationClick={handleRecommendationClick}
            />
          </div>
          {showSavedStyles && (
            <div className="mt-7">
              <ArStyleSection
                styles={arStyles.data}
                isLoading={arStyles.isLoading}
                isError={arStyles.isError}
                onRetry={() => void arStyles.refetch()}
                onArClick={() => navigate("/ar")}
              />
            </div>
          )}
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

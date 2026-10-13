import { font } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared";
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
  const displayName = profileName.trim() || "고객";

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
              {displayName}님, 오늘도 예쁜 하루 되세요!
            </h1>
            <p className={cn(font.label.medium, "text-[var(--home-muted)]")}>
              시술 기록을 저장하고, 스타일을 추천받으세요
            </p>
          </div>
          <RecentRecordCard
            record={recentRecord.data}
            isLoading={recentRecord.isLoading}
            isError={recentRecord.isError}
            onAddClick={() => navigate("/cuts/add")}
            onClick={() => navigate("/cuts")}
          />
          <div className="mt-6 grid grid-cols-[minmax(0,1.126fr)_minmax(0,1fr)] gap-[14px] max-[374px]:grid-cols-1">
            <ArStyleSection
              styles={arStyles.data}
              isLoading={arStyles.isLoading}
              isError={arStyles.isError}
              onMoreClick={() => navigate("/ar")}
              onTryClick={() => navigate("/ar")}
            />
            <RecommendationSection
              recommendations={recommendations.data}
              isLoading={recommendations.isLoading}
              isError={recommendations.isError}
              onMoreClick={() => navigate("/recommend")}
              onRecommendationClick={() => navigate("/recommend")}
            />
          </div>
          <div className="mt-6">
            <ShareRecordBanner
              hasRecord={Boolean(recentRecord.data)}
              onClick={() => navigate(recentRecord.data ? "/cuts" : "/cuts/add")}
            />
          </div>
        </div>
      </section>
    </cap-page>
  );
};
export default HomePage;

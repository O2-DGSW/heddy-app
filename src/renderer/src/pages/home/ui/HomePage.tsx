import { font } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared";
import {
  ArStyleSection,
  HOME_AR_STYLES,
  HOME_RECOMMENDATIONS,
  ShareRecordBanner,
  HomeHeader,
  RecentRecordCard,
  RecommendationSection,
  HOME_RECENT_RECORD,
  homeTheme,
} from "@/features/home";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <cap-page>
      <section
        aria-labelledby="home-greeting"
        style={homeTheme}
        className="h-full overflow-y-auto bg-[var(--home-background)] text-[var(--home-text)]"
      >
        <div className="mx-auto w-[350px] pt-1 pb-6">
          <HomeHeader onProfileClick={() => navigate("/profile")} />
          <div className="mt-5 mb-6 flex flex-col gap-1">
            <h1 id="home-greeting" className={font.headline1.bold}>
              오용준님, 오늘도 예쁜 하루 되세요!
            </h1>
            <p className={cn(font.label.medium, "text-[var(--home-muted)]")}>
              시술 기록을 저장하고, 스타일을 추천받으세요
            </p>
          </div>
          <RecentRecordCard record={HOME_RECENT_RECORD} onClick={() => navigate("/cuts")} />
          <div className="mt-6 grid grid-cols-[178px_158px] gap-[14px]">
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
            <ShareRecordBanner onClick={() => navigate("/cuts")} />
          </div>
        </div>
      </section>
    </cap-page>
  );
};
export default HomePage;

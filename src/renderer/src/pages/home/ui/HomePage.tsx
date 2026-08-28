import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { SHORTCUT_CARDS } from "../model/constants";

import HomeHeader from "./HomeHeader";
import RecentRecordCard from "./RecentRecordCard";
import RecommendationSection from "./RecommendationSection";
import ShortcutCard from "./ShortcutCard";

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  return (
    <section
      aria-labelledby="home-greeting"
      className="flex min-h-full flex-col"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <HomeHeader onProfileClick={() => handleNavigate("/profile")} />

      <div className="mx-auto mt-[24px] w-[calc(100%_-_52px)] max-w-[350px]">
        <h1
          id="home-greeting"
          className={font.title2.bold}
          style={{ color: lightTheme.label.neutral }}
        >
          오용준님, 안녕하세요
        </h1>
        <p className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
          시술 기록을 저장하고, 스타일을 추천받으세요
        </p>
      </div>

      <div className="mx-auto mt-[32px] grid w-[calc(100%_-_42px)] max-w-[359px] grid-cols-[1.041fr_1fr] gap-3">
        <RecentRecordCard onClick={() => handleNavigate("/cuts/record-1")} />

        <div className="grid h-[228px] grid-rows-2 gap-2">
          {SHORTCUT_CARDS.map(card => (
            <ShortcutCard key={card.id} card={card} onClick={() => handleNavigate(card.to)} />
          ))}
        </div>
      </div>

      <RecommendationSection
        onMoreClick={() => handleNavigate("/recommend")}
        onRecommendationClick={() => handleNavigate("/recommend")}
      />
    </section>
  );
};

export default HomePage;

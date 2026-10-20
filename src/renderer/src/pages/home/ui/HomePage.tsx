import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";
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

const isScrolledToBottom = (element: HTMLElement): boolean =>
  element.scrollHeight > element.clientHeight &&
  element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

const HomePage = () => {
  const navigate = useNavigate();
  const { profileName, recentRecord, arStyles, recommendations } = useHomeData();
  const scrollRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const hasRecentRecord = recentRecord.isLoading || Boolean(recentRecord.data);
  const showSavedStyles = arStyles.isLoading || arStyles.isError || arStyles.data.length > 0;

  const handleScroll = (event: UIEvent<HTMLElement>) => {
    setIsAtBottom(isScrolledToBottom(event.currentTarget));
  };

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

  useEffect(() => {
    const scrollElement = scrollRef.current;
    const content = contentRef.current;
    if (!scrollElement || !content || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      setIsAtBottom(isScrolledToBottom(scrollElement));
    });
    observer.observe(scrollElement);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  return (
    <cap-page>
      <div className="relative h-full" style={homeTheme}>
        <section
          ref={scrollRef}
          onScroll={handleScroll}
          aria-labelledby="home-greeting"
          className="h-full [overflow-wrap:anywhere] overflow-y-auto overscroll-contain no-scrollbar bg-[var(--home-surface)] text-[var(--home-text)]"
        >
          <div
            ref={contentRef}
            className="mx-auto w-full max-w-[532px] px-[clamp(16px,5vw,24px)] pb-8 pt-2"
          >
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
        {isAtBottom && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-linear-to-t from-[color-mix(in_srgb,var(--home-text)_10%,transparent)] to-transparent"
          />
        )}
      </div>
    </cap-page>
  );
};
export default HomePage;

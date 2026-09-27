import recentHair from "../assets/recent-hair.png";
import type { RecentRecordType } from "./types";

// Temporary home response. Replace with mapped API data when integration resumes.
export const HOME_RECENT_RECORD: RecentRecordType = {
  id: "demo-record",
  date: "2026-07-18",
  procedureName: "다운펌",
  salonName: "준오헤어 강남점",
  designerName: "오용준",
  rating: 5,
  thumbnailUrl: recentHair,
  colorName: "내추럴 블랙",
  daysAgo: "7일 전",
  memo: "앞머리 뜸 있음. 옆머리는 자연스럽게 눌러주세요.",
};

import arStyleImage from "../assets/ar-style.png";
import type { ArStyleType } from "./types";
export const HOME_AR_STYLES: ArStyleType[] = [
  { id: "demo-ar-1", name: "애즈펌", imageUrl: arStyleImage },
  { id: "demo-ar-2", name: "애즈펌 2", imageUrl: arStyleImage },
  { id: "demo-ar-3", name: "애즈펌 3", imageUrl: arStyleImage },
];

import recommendedHair from "../assets/recommended-hair.png";
import type { RecommendationCardType } from "./types";
export const HOME_RECOMMENDATIONS: RecommendationCardType[] = Array.from(
  { length: 3 },
  (_, index) => ({
    id: `demo-recommendation-${index + 1}`,
    rank: index + 1,
    title: "다운펌",
    imageUrl: recommendedHair,
    colorName: "내추럴 블랙",
    matchRate: 92,
    tags: [],
  })
);

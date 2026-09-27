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

import type { CutsCategory } from "@/features/cuts/model/types/CutsRecord.types";

export const CUTS_CATEGORIES = ["전체", "커트", "펌", "염색", "클리닉"] as const;

export type CutsCategoryFilterValue = (typeof CUTS_CATEGORIES)[number];

export const isCutsCategory = (value: CutsCategoryFilterValue): value is CutsCategory =>
  value !== "전체";

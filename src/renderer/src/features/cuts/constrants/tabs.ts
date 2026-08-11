export const CUTS_TABS = [{ label: "전체" }, { label: "분석됨" }, { label: "분석 대기" }] as const;

export type CutsStatusFilter = (typeof CUTS_TABS)[number]["label"];

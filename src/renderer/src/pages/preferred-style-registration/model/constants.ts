import type { PreferredStyleTabType, StyleTag } from "./types";

export const SELECTED_BACKGROUND_COLOR = "#F4FBF8";

export const MAX_VISIBLE_RESULT_TAGS = 2;

export const MAX_STYLE_TAG_SELECTION = 10;

export const PREFERRED_STYLE_TABS = [
  "preferred",
  "excluded",
] as const satisfies readonly PreferredStyleTabType[];

export const INITIAL_STYLE_TAGS: StyleTag[] = [
  { id: "layered-cut", label: "#레이어드컷", status: "preferred" },
  { id: "hush-cut", label: "#허쉬컷", status: "preferred" },
  { id: "bob-cut", label: "#단발", status: "none" },
  { id: "hippie-perm", label: "#히피펌", status: "none" },
  { id: "volume-magic", label: "#볼륨매직", status: "preferred" },
  { id: "ash-brown", label: "#애쉬브라운", status: "excluded" },
  { id: "bleach", label: "#탈색", status: "none" },
  { id: "clinic", label: "#클리닉", status: "none" },
  { id: "dandy-cut", label: "#댄디컷", status: "preferred" },
  { id: "leaf-cut", label: "#리프컷", status: "none" },
  { id: "parted-perm", label: "#가르마펌", status: "preferred" },
  { id: "c-curl", label: "#C컬펌", status: "excluded" },
  { id: "s-curl", label: "#S컬펌", status: "none" },
  { id: "tassel-cut", label: "#태슬컷", status: "preferred" },
];

export const TAB_LABEL_BY_TYPE: Record<PreferredStyleTabType, string> = {
  preferred: "선호",
  excluded: "제외",
};

export const TITLE_BY_TAB: Record<PreferredStyleTabType, string> = {
  preferred: "선호 스타일 등록",
  excluded: "제외 스타일 등록",
};

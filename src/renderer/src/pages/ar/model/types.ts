import type { HAIRSTYLE_OPTIONS } from "./constants";

export type HairstyleOptionId = (typeof HAIRSTYLE_OPTIONS)[number]["id"];
export type ArModalType = "candidate-save" | "capture";

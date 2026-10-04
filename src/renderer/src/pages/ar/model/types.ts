export type { ArHairstyleOption, HairstyleOptionId } from "@/features/ar-preview";

export type ArModalType = "candidate-save";

export interface ArGroomFitSettings {
  groom_color: string;
  dyn: number;
  scale: number;
  offset: number;
  groom_fwd: number;
}

export type ArGroomStatusType = "idle" | "loading" | "ok" | "error";

export interface ArGroomState {
  groom?: string;
  status: ArGroomStatusType;
  message?: string;
}

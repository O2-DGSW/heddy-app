/** AR 서버에 등록된 헤어스타일(groom) 하나 */
export interface ArHairstyleOption {
  id: string;
  imageUrl?: string;
  label: string;
}

export type HairstyleOptionId = string;

/** 스타일을 얼굴에 맞추는 값. AR 서버 fit 명령에 그대로 실린다 */
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

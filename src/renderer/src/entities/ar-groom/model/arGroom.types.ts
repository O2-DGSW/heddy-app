/** AR 서버에 등록된 헤어스타일(groom) 하나 */
export interface ArHairstyleOption {
  /** 서버에 스타일을 적용할 때 전송하는 groom 식별자 */
  name: string;
  /** 후보 스타일 API에서 사용하는 카탈로그 UUID. AR groom 이름과는 별도 식별자다 */
  hairstyleId?: string;
  label: string;
  gender?: string;
  type?: string;
  tags?: string[];
  thumbUrl?: string;
  viewsUrl?: string;
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

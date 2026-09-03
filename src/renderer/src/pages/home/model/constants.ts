import arMascotImage from "../assets/ar-mascot.png";
import logoPart1 from "../assets/logo-d1.svg";
import logoPart2 from "../assets/logo-y.svg";
import logoPart3 from "../assets/logo-h.svg";
import logoPart4 from "../assets/logo-e.svg";
import logoPart5 from "../assets/logo-d2.svg";
import shareScissorsImage from "../assets/share-scissors.png";

import type { LogoPartType, ShortcutCardType } from "./types";
import type { ServiceType, TreatmentRecordListParams } from "@/entities";

export const HOME_RECENT_RECORD_PARAMS: TreatmentRecordListParams = {
  sort: "performedAt,desc",
};

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "탈색",
  CLINIC: "클리닉",
  STYLING: "스타일링",
  OTHER: "기타",
};

export const SHORTCUT_CARDS: ShortcutCardType[] = [
  {
    id: "ar-style",
    eyebrow: "나에게 어울리는 스타일로",
    title: "AR 스타일",
    imageSrc: arMascotImage,
    imageAlt: "AR 스타일 캐릭터",
    imageClassName:
      "right-[clamp(8px,3vw,13px)] bottom-[clamp(10px,2.3svh,18px)] h-[clamp(42px,6.2svh,52px)] w-[clamp(42px,6.2svh,52px)]",
    to: "/ar",
  },
  {
    id: "share-record",
    eyebrow: "최근 기록을",
    title: "시술기록 공유",
    imageSrc: shareScissorsImage,
    imageAlt: "시술기록 공유 가위",
    imageClassName:
      "right-[clamp(8px,2.6vw,11px)] bottom-[clamp(6px,1.4svh,12px)] h-[clamp(52px,8.2svh,70px)] w-[clamp(50px,7.8svh,67px)] rotate-[-7deg]",
    to: "/cuts/record-1/share",
  },
];

export const HEDDY_LOGO_PARTS: LogoPartType[] = [
  {
    src: logoPart1,
    className: "left-0 top-[0.13px] h-[21.68px] w-[15.43px]",
  },
  {
    src: logoPart2,
    className: "left-[16.35px] top-[5.79px] h-[15.94px] w-[16.31px]",
  },
  {
    src: logoPart3,
    className: "left-[33.48px] top-0 h-[21.74px] w-[15.97px]",
  },
  {
    src: logoPart4,
    className: "left-[50.47px] top-0 h-[21.74px] w-[15.97px]",
  },
  {
    src: logoPart5,
    className: "left-[67.72px] top-[6.53px] h-[21.47px] w-[15.4px]",
  },
];

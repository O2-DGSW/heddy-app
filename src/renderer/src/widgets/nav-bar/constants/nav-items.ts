import type { NavItem } from "../model/types.ts";

import ArIcon from "../assets/ar.svg?react";
import CutsIcon from "../assets/cuts.svg?react";
import HomeIcon from "../assets/home.svg?react";
import ProfileIcon from "../assets/profile.svg?react";
import RecommendIcon from "../assets/recommend.svg?react";

export const NAV_ITEMS: NavItem[] = [
  { Icon: HomeIcon, iconClassName: "h-[30px] w-[30px]", title: "홈", to: "/home" },
  { Icon: CutsIcon, title: "기록", to: "/cuts" },
  { Icon: ArIcon, title: "AR", to: "/ar" },
  { Icon: RecommendIcon, title: "추천", to: "/recommend" },
  { Icon: ProfileIcon, title: "프로필", to: "/profile" },
];

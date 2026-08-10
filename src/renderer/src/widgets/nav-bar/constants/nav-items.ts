import type { NavItem } from "../model/types.ts";

import HomeIcon from "../assets/home.svg?react";
import HairShopIcon from "../assets/hair-shop.svg?react";
import ReservationIcon from "../assets/reservate.svg?react";
import CutsIcon from "../assets/cuts.svg?react";
import ProfileIcon from "../assets/profile.svg?react";

export const NAV_ITEMS: NavItem[] = [
    { Icon: HomeIcon, title: "홈", to: "/" },
    { Icon: ReservationIcon, title: "예약", to: "/reservation" },
    { Icon: CutsIcon, title: "시술", to: "/cuts" },
    { Icon: HairShopIcon, title: "미용실", to: "/shop" },
    { Icon: ProfileIcon, title: "프로필", to: "/profile" },
];

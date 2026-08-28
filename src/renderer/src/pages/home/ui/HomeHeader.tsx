import alarmIcon from "../assets/alarm.svg";
import profileHeadIcon from "../assets/profile-head.svg";
import type { HomeHeaderProps } from "../model/types";

import HeddyLogo from "./HeddyLogo";

const HomeHeader = ({ onProfileClick }: HomeHeaderProps) => {
  return (
    <header className="mx-auto flex h-[36px] w-[calc(100%_-_58px)] max-w-[343px] items-center justify-between">
      <HeddyLogo />

      <div className="flex items-center gap-3">
        <span aria-label="알림" role="img" className="flex size-[28px] items-center justify-center">
          <img src={alarmIcon} alt="" className="size-[28px]" />
        </span>
        <button
          type="button"
          aria-label="프로필로 이동"
          className="flex size-[36px] items-center justify-center rounded-full border-0 bg-transparent p-0"
          onClick={onProfileClick}
        >
          <img src={profileHeadIcon} alt="" className="size-[36px]" />
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;

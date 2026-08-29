import profileHeadIcon from "@/pages/home/assets/profile-head.svg";
import type { HomeHeaderProps } from "@/pages/home/model/types.ts";

import HeddyLogo from "./HeddyLogo.tsx";

const HomeHeader = ({ onProfileClick }: HomeHeaderProps) => {
  return (
    <header className="mx-auto flex h-[36px] w-[calc(100%_-_58px)] max-w-[343px] items-center justify-between">
      <HeddyLogo />

      <div className="flex items-center gap-3">
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

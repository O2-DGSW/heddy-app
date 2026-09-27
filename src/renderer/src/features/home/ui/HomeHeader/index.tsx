import { useState } from "react";
import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";
import profileIcon from "../../assets/profile-head.svg";
import alarmIcon from "../../assets/alarm.svg";
import HeddyLogo from "../HeddyLogo";

interface HomeHeaderProps {
  onProfileClick: () => void;
}
const HomeHeader = ({ onProfileClick }: HomeHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return (
    <header className="relative flex min-h-11 items-center justify-between">
      <HeddyLogo />
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="알림"
          aria-expanded={notificationsOpen}
          aria-controls="home-notifications"
          className="flex size-11 items-center justify-center rounded-full"
          onClick={() => setNotificationsOpen(open => !open)}
        >
          <img src={alarmIcon} alt="" />
        </button>
        <button
          type="button"
          aria-label="프로필로 이동"
          className="flex size-11 items-center justify-center rounded-full"
          onClick={onProfileClick}
        >
          <img src={profileIcon} alt="" />
        </button>
      </div>
      {notificationsOpen && (
        <div
          id="home-notifications"
          role="status"
          className={cn(
            "absolute right-0 top-12 z-10 rounded-xl bg-[var(--home-surface)] p-4 text-[var(--home-muted)] shadow-md",
            font.caption.medium
          )}
        >
          현재 새로운 알림이 없습니다.
        </div>
      )}
    </header>
  );
};
export default HomeHeader;

import { useEffect, useRef, useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { ArrowIcon, cn } from "@/shared";
import profileIcon from "../assets/profile-head.svg";
import alarmIcon from "../assets/alarm.svg";
import arPhonePreview from "../assets/ar-phone-preview.png";
import HeddyLogo from "./HeddyLogo";

interface HomeHeaderProps {
  profileName: string;
  onProfileClick: () => void;
  onArClick: () => void;
}
const HomeHeader = ({ profileName, onProfileClick, onArClick }: HomeHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const displayName = profileName.trim();

  const handleToggleNotifications = () => setNotificationsOpen(open => !open);

  useEffect(() => {
    if (!notificationsOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        !(target instanceof Node) ||
        notificationButtonRef.current?.contains(target) ||
        notificationsRef.current?.contains(target)
      ) {
        return;
      }
      setNotificationsOpen(false);
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNotificationsOpen(false);
      notificationButtonRef.current?.focus();
    };

    // 다른 버튼의 동작을 막지 않고, 터치·마우스 입력을 모두 처리한다.
    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown, true);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [notificationsOpen]);

  return (
    <header>
      <div className="relative flex min-h-12 items-center justify-between">
        <HeddyLogo />
        <div className="flex items-center gap-1">
          <button
            ref={notificationButtonRef}
            type="button"
            aria-label="알림"
            aria-expanded={notificationsOpen}
            aria-controls="home-notifications"
            className="flex size-11 items-center justify-center rounded-full"
            onClick={handleToggleNotifications}
          >
            {/* 로고 본문·프로필 그림과 시각적 중심을 맞추고 클릭 영역은 유지한다. */}
            <img src={alarmIcon} alt="" width={28} height={28} className="-translate-y-[3px]" />
          </button>
          <button
            type="button"
            aria-label="프로필로 이동"
            className="flex size-11 items-center justify-center rounded-full"
            onClick={onProfileClick}
          >
            <img src={profileIcon} alt="" width={40} height={40} />
          </button>
        </div>
        {notificationsOpen && (
          <div
            ref={notificationsRef}
            id="home-notifications"
            role="status"
            className={cn(
              "absolute right-0 top-14 z-10 rounded-2xl border border-[var(--home-line)] bg-[var(--home-surface)] p-4 text-[var(--home-secondary)] shadow-sm",
              font.caption.medium
            )}
          >
            현재 새로운 알림이 없습니다.
          </div>
        )}
      </div>
      <div className="mb-5 mt-6">
        <h1
          id="home-greeting"
          className={cn(font.headline1.bold, "flex min-w-0 items-center whitespace-nowrap")}
        >
          {displayName && <span className="truncate">{displayName}</span>}
          <span className="shrink-0">{displayName ? "님, 반가워요 👋" : "반가워요 👋"}</span>
        </h1>
      </div>
      <section
        aria-labelledby="home-discover-title"
        className="relative isolate rounded-[26px] bg-[var(--home-soft)] p-5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
        >
          <span className="absolute -right-5 top-3 size-36 rounded-full bg-[var(--home-surface)]/50" />
        </div>
        <div className="relative z-10 pr-24 min-[375px]:pr-28">
          <span
            className={cn(
              "inline-flex rounded-full bg-[var(--home-surface)]/80 px-2.5 py-1 text-[var(--home-share-text)]",
              font.caption.semiBold
            )}
          >
            나의 스타일 발견
          </span>
          <h2 id="home-discover-title" className={cn(font.headline1.bold, "mt-3 break-keep")}>
            새로운 머리,
            <br />
            미리 만나볼까요?
          </h2>
          <p className={cn(font.caption.medium, "mt-2 break-keep text-[var(--home-secondary)]")}>
            자르기 전, 나에게 어울리는지 확인해요.
          </p>
        </div>
        <button
          type="button"
          onClick={onArClick}
          className={cn(
            "relative z-20 mt-5 flex min-h-12 w-full items-center justify-between rounded-2xl bg-[var(--home-primary)] px-4 text-[var(--home-surface)] transition-opacity active:opacity-80",
            font.label.semiBold
          )}
        >
          AR로 미리보기
          <ArrowIcon className="size-3 rotate-180" color={lightTheme.label.buttonText} />
        </button>
        <img
          src={arPhonePreview}
          alt=""
          width={1323}
          height={1189}
          decoding="async"
          className="pointer-events-none absolute -right-8 bottom-6 z-0 h-52 w-56 object-contain min-[375px]:h-56 min-[375px]:w-60"
        />
      </section>
    </header>
  );
};
export default HomeHeader;

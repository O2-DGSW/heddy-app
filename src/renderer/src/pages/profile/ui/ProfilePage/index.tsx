import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import arrowRightIcon from "../../assets/arrow-right.svg";
import bookmarkIcon from "../../assets/bookmark.svg";
import heartIcon from "../../assets/heart.svg";
import profileAvatar from "../../assets/profile-avatar.png";
import settingsIcon from "../../assets/settings.svg";
import sharePermissionsIcon from "../../assets/share-permissions.svg";

interface ProfileStat {
  label: string;
  value: number;
}

interface ProfileMenuItem {
  icon: string;
  label: string;
  to?: string;
}

const PROFILE_NAME = "오용준";

const PROFILE_STATS: ProfileStat[] = [
  { label: "시술 기록", value: 4 },
  { label: "AI 분석", value: 2 },
  { label: "AR 후보", value: 3 },
  { label: "공유 중", value: 1 },
];

const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { icon: heartIcon, label: "선호 스타일 등록", to: "/profile/preferred-style" },
  { icon: settingsIcon, label: "회원정보 수정" },
  { icon: sharePermissionsIcon, label: "공유 권한 관리", to: "/profile/share-permissions" },
  { icon: bookmarkIcon, label: "저장한 후보 스타일" },
];

interface ProfileMenuRowProps {
  item: ProfileMenuItem;
  onClick?: () => void;
}

const ProfileMenuRow = ({ item, onClick }: ProfileMenuRowProps) => {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-[8px]">
        <img alt="" className="h-[18px] w-[18px] shrink-0" src={item.icon} />
        <span
          className={`${font.body.medium} truncate`}
          style={{ color: lightTheme.label.alternative }}
        >
          {item.label}
        </span>
      </span>
      <img
        alt=""
        className="h-[14px] w-[14px] shrink-0"
        src={arrowRightIcon}
        style={{ transform: "rotate(180deg)" }}
      />
    </>
  );

  if (!onClick) {
    return <div className="flex h-[21px] items-center justify-between">{content}</div>;
  }

  return (
    <button
      className="flex h-[21px] w-full items-center justify-between border-0 bg-transparent p-0 text-left"
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleMenuClick = (to?: string) => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <section
      aria-labelledby="profile-title"
      className="flex min-h-full flex-col"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div style={{ backgroundColor: lightTheme.background.normal }}>
        <div className="mx-[26px] flex flex-col gap-[28px] pb-[25px] pt-[22px]">
          <header className="flex flex-col gap-[28px]">
            <div className="flex items-center gap-[20px]">
              <img alt="" className="h-[68px] w-[68px] shrink-0" src={profileAvatar} />
              <h1
                className={font.headline1.bold}
                id="profile-title"
                style={{ color: lightTheme.label.neutral }}
              >
                {PROFILE_NAME}님
              </h1>
            </div>

            <dl
              className="grid h-[87px] grid-cols-4 place-items-center rounded-[15px]"
              style={{ backgroundColor: "#F4FBF8" }}
            >
              {PROFILE_STATS.map(stat => (
                <div className="flex flex-col items-center gap-[4px]" key={stat.label}>
                  <dd className={`${font.headline1.medium} flex items-center gap-[2px]`}>
                    <span style={{ color: lightTheme.primary.normal }}>{stat.value}</span>
                    <span style={{ color: lightTheme.label.alternative }}>건</span>
                  </dd>
                  <dt className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </header>
        </div>
      </div>

      <div className="flex px-[22px] py-[37px]" style={{ backgroundColor: lightTheme.fill.normal }}>
        <section
          aria-labelledby="profile-settings-title"
          className="flex h-[370px] w-full flex-col items-center justify-between rounded-[15px] px-[22px] pb-[19px] pt-[19px] shadow-[0_0_6px_rgba(0,0,0,0.02)]"
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          <div className="flex w-full max-w-[300px] flex-col gap-[24px]">
            <h2
              className={font.headline1.semiBold}
              id="profile-settings-title"
              style={{ color: lightTheme.label.assistive }}
            >
              설정
            </h2>
            <div className="flex flex-col gap-[36px]">
              {PROFILE_MENU_ITEMS.map(item => (
                <ProfileMenuRow
                  item={item}
                  key={item.label}
                  onClick={item.to ? () => handleMenuClick(item.to) : undefined}
                />
              ))}
            </div>
          </div>

          <div className="grid w-full max-w-[300px] grid-cols-2 gap-[6px]">
            <div
              className={`flex h-[30px] items-center justify-center rounded-[5px] ${font.label.medium}`}
              style={{
                backgroundColor: lightTheme.label.disable,
                color: lightTheme.label.alternative,
              }}
            >
              로그아웃
            </div>
            <div
              className={`flex h-[30px] items-center justify-center rounded-[5px] ${font.label.medium}`}
              style={{
                backgroundColor: lightTheme.status.error,
                color: lightTheme.label.buttonText,
              }}
            >
              회원 탈퇴
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default ProfilePage;

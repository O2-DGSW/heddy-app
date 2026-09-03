import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { useLogout } from "@/features/auth/logout";
import { useGetTreatmentRecords } from "@/entities/record";
import { useGetShares } from "@/entities/share";
import { chevronRightIcon, profileAvatar } from "@/shared";

import bookmarkIcon from "../../assets/bookmark.svg";
import heartIcon from "../../assets/heart.svg";
import settingsIcon from "../../assets/settings.svg";
import sharePermissionsIcon from "../../assets/share-permissions.svg";
import { useProfile } from "../../model/useProfile";

interface ProfileStat {
  label: string;
  value: number;
}

interface ProfileMenuItem {
  icon: string;
  label: string;
  to?: string;
  isAvailable: boolean;
}

const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  {
    icon: heartIcon,
    label: "선호 스타일 등록",
    to: "/profile/preferred-style",
    isAvailable: true,
  },
  { icon: settingsIcon, label: "회원정보 수정", to: "/profile/edit", isAvailable: true },
  {
    icon: sharePermissionsIcon,
    label: "공유 권한 관리",
    to: "/profile/share-permissions",
    isAvailable: true,
  },
  { icon: bookmarkIcon, label: "저장한 후보 스타일", isAvailable: false },
];

interface ProfileMenuRowProps {
  item: ProfileMenuItem;
  onClick: () => void;
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
        src={chevronRightIcon}
        style={{ transform: "rotate(180deg)" }}
      />
    </>
  );

  return (
    <button
      aria-label={item.isAvailable ? item.label : `${item.label} 기능 준비 중`}
      className="flex h-[21px] w-full items-center justify-between border-0 bg-transparent p-0 text-left disabled:cursor-not-allowed disabled:opacity-40"
      disabled={!item.isAvailable}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
};

const getProfileStatCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;

const getProfileName = (nickname: unknown, isLoading: boolean) => {
  if (typeof nickname === "string" && nickname.trim()) {
    return nickname;
  }

  return isLoading ? "불러오는 중" : "사용자";
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const { data: treatmentRecords } = useGetTreatmentRecords({ page: 0, size: 1 });
  const { data: shares } = useGetShares({ status: "ACTIVE", page: 0, size: 1 });
  const {
    errorMessage: logoutErrorMessage,
    handleLogout,
    isPending: isLogoutPending,
  } = useLogout();
  const profileName = getProfileName(profile?.nickname, isLoading);
  const profileStats: ProfileStat[] = [
    { label: "시술 기록", value: getProfileStatCount(treatmentRecords?.page?.total_elements) },
    { label: "AI 분석", value: 0 },
    { label: "AR 후보", value: 0 },
    { label: "공유 중", value: getProfileStatCount(shares?.page?.total_elements) },
  ];

  const handleMenuClick = (to?: string) => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <cap-page>
      <section
        aria-labelledby="profile-title"
        className="flex h-full flex-col overflow-y-auto overscroll-contain no-scrollbar [-webkit-overflow-scrolling:touch]"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        <div style={{ backgroundColor: lightTheme.background.normal }}>
          <div className="mx-auto flex w-full max-w-[402px] flex-col gap-[28px] px-[clamp(16px,6.47vw,26px)] pb-[25px] pt-[22px]">
            <header className="flex flex-col gap-[28px]">
              <div className="flex items-center gap-[20px]">
                <div
                  className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full p-[12px]"
                  style={{ backgroundColor: lightTheme.background.neutral }}
                >
                  <img alt="" className="h-full w-full object-contain" src={profileAvatar} />
                </div>
                <h1
                  className={`${font.headline1.semiBold} min-w-0 truncate`}
                  id="profile-title"
                  style={{ color: lightTheme.label.neutral }}
                >
                  {profileName}님
                </h1>
              </div>

              <dl
                className="grid h-[87px] grid-cols-4 place-items-center rounded-[15px]"
                style={{ backgroundColor: "#F4FBF8" }}
              >
                {profileStats.map(stat => (
                  <div className="flex min-w-0 flex-col items-center gap-[4px]" key={stat.label}>
                    <dd className={`${font.headline1.medium} flex items-center gap-[2px]`}>
                      <span style={{ color: lightTheme.primary.normal }}>{stat.value}</span>
                      <span style={{ color: lightTheme.label.alternative }}>건</span>
                    </dd>
                    <dt
                      className={`${font.label.medium} whitespace-nowrap text-center`}
                      style={{ color: lightTheme.label.assistive }}
                    >
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </header>
          </div>
        </div>

        <div
          className="flex flex-1 justify-center px-[clamp(16px,5.47vw,22px)] py-[clamp(24px,9.2vw,37px)]"
          style={{ backgroundColor: lightTheme.fill.normal }}
        >
          <section
            aria-labelledby="profile-settings-title"
            className="flex min-h-[410px] w-full max-w-[349px] self-stretch flex-col items-center justify-between rounded-[15px] px-[clamp(16px,5.47vw,22px)] pb-[19px] pt-[19px] shadow-[0_0_6px_rgba(0,0,0,0.02)]"
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
                    onClick={() => handleMenuClick(item.to)}
                  />
                ))}
              </div>
            </div>

            <div className="grid w-full max-w-[300px] grid-cols-2 gap-[6px]">
              <button
                className={`flex h-[30px] items-center justify-center rounded-[5px] ${font.label.medium} disabled:cursor-not-allowed`}
                disabled={isLogoutPending}
                onClick={() => void handleLogout()}
                type="button"
                style={{
                  backgroundColor: lightTheme.label.disable,
                  color: lightTheme.label.alternative,
                }}
              >
                {isLogoutPending ? "로그아웃 중" : "로그아웃"}
              </button>
              <button
                aria-label="회원 탈퇴 기능 준비 중"
                className={`flex h-[30px] items-center justify-center rounded-[5px] ${font.label.medium} cursor-not-allowed opacity-50`}
                disabled
                type="button"
                style={{
                  backgroundColor: lightTheme.status.error,
                  color: lightTheme.label.buttonText,
                }}
              >
                회원 탈퇴
              </button>
            </div>
            {logoutErrorMessage && (
              <p
                className={font.label.medium}
                role="alert"
                style={{ color: lightTheme.status.error }}
              >
                {logoutErrorMessage}
              </p>
            )}
          </section>
        </div>
      </section>
    </cap-page>
  );
};

export default ProfilePage;

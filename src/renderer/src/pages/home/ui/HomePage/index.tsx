import { font, lightTheme, palette } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import alarmIcon from "../../assets/alarm.svg";
import arrowIcon from "../../assets/arrow.svg";
import arMascotImage from "../../assets/ar-mascot.png";
import bookmarkIcon from "../../assets/bookmark.svg";
import colorDotIcon from "../../assets/color-dot.svg";
import logoPart1 from "../../assets/logo-d1.svg";
import logoPart2 from "../../assets/logo-y.svg";
import logoPart3 from "../../assets/logo-h.svg";
import logoPart4 from "../../assets/logo-e.svg";
import logoPart5 from "../../assets/logo-d2.svg";
import profileHeadIcon from "../../assets/profile-head.svg";
import recentHairImage from "../../assets/recent-hair.png";
import shareScissorsImage from "../../assets/share-scissors.png";
import starIcon from "../../assets/star.svg";

type ShortcutCardType = {
  id: string;
  eyebrow: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName: string;
  to: string;
};

type RecommendationCardType = {
  id: string;
  rank: number;
  title: string;
  colorName: string;
  tags: string[];
};

const RECENT_RECORD = {
  date: "2026-07-18",
  procedureName: "다운펌",
  salonName: "준오헤어 강남점",
  designerName: "오용준",
  rating: 5,
};

const SHORTCUT_CARDS: ShortcutCardType[] = [
  {
    id: "ar-style",
    eyebrow: "나에게 어울리는 스타일로",
    title: "AR 스타일",
    imageSrc: arMascotImage,
    imageAlt: "AR 스타일 캐릭터",
    imageClassName: "right-[13px] top-[38px] h-[52px] w-[52px]",
    to: "/ar",
  },
  {
    id: "share-record",
    eyebrow: "최근 기록을",
    title: "시술기록 공유",
    imageSrc: shareScissorsImage,
    imageAlt: "시술기록 공유 가위",
    imageClassName: "right-[11px] top-[20px] h-[70px] w-[67px] rotate-[-7deg]",
    to: "/cuts/record-1/share",
  },
];

const RECOMMENDATION_CARDS: RecommendationCardType[] = [
  {
    id: "recommend-1",
    rank: 1,
    title: "남자 다운펌",
    colorName: "내추럴 블랙",
    tags: ["남자", "다운펌"],
  },
  {
    id: "recommend-2",
    rank: 1,
    title: "남자 다운펌",
    colorName: "내추럴 블랙",
    tags: ["남자", "다운펌"],
  },
];

const HEDDY_LOGO_PARTS = [
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

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  return (
    <section
      aria-labelledby="home-greeting"
      className="flex min-h-full flex-col"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <HomeHeader onProfileClick={() => handleNavigate("/profile")} />

      <div className="mx-auto mt-[24px] w-[calc(100%_-_52px)] max-w-[350px]">
        <h1
          id="home-greeting"
          className={font.title2.bold}
          style={{ color: lightTheme.label.neutral }}
        >
          오용준님, 머리 함 잘라보까요!
        </h1>
        <p className={font.label.medium} style={{ color: lightTheme.label.assistive }}>
          시술 기록을 저장하고, 스타일을 추천받으세요
        </p>
      </div>

      <div className="mx-auto mt-[32px] grid w-[calc(100%_-_42px)] max-w-[359px] grid-cols-[1.041fr_1fr] gap-3">
        <RecentRecordCard onClick={() => handleNavigate("/cuts/record-1")} />

        <div className="grid h-[228px] grid-rows-2 gap-2">
          {SHORTCUT_CARDS.map(card => (
            <ShortcutCard key={card.id} card={card} onClick={() => handleNavigate(card.to)} />
          ))}
        </div>
      </div>

      <RecommendationSection
        onMoreClick={() => handleNavigate("/recommend")}
        onRecommendationClick={() => handleNavigate("/recommend")}
      />
    </section>
  );
};

interface HomeHeaderProps {
  onProfileClick: () => void;
}

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

const HeddyLogo = () => {
  return (
    <span aria-label="heddy" role="img" className="relative block h-[28px] w-[83.12px] shrink-0">
      {HEDDY_LOGO_PARTS.map(({ src, className }) => (
        <img key={src} src={src} alt="" className={`absolute ${className}`} />
      ))}
    </span>
  );
};

interface RecentRecordCardProps {
  onClick: () => void;
}

const RecentRecordCard = ({ onClick }: RecentRecordCardProps) => {
  return (
    <button
      type="button"
      className="h-[228px] overflow-hidden rounded-[10px] p-[14px] text-left shadow-[0_0_4px_rgba(0,0,0,0.13)] active:scale-[0.99]"
      style={{ backgroundColor: lightTheme.background.normal }}
      onClick={onClick}
    >
      <span className="flex h-full flex-col gap-[10px]">
        <span className={font.label.medium} style={{ color: lightTheme.primary.normal }}>
          최근 시술 기록
        </span>

        <span className="block h-[95px] overflow-hidden rounded-[12px]">
          <CroppedHairImage alt="최근 시술 사진" />
        </span>

        <span className="flex min-w-0 flex-col gap-px">
          <span className={font.caption.medium} style={{ color: lightTheme.label.alternative }}>
            {RECENT_RECORD.date}
          </span>
          <span className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
            {RECENT_RECORD.procedureName}
          </span>
          <span
            className={`${font.caption.medium} block truncate`}
            style={{ color: lightTheme.label.alternative }}
          >
            {RECENT_RECORD.salonName} · {RECENT_RECORD.designerName}
          </span>
          <RatingStars rating={RECENT_RECORD.rating} />
        </span>
      </span>
    </button>
  );
};

interface ShortcutCardProps {
  card: ShortcutCardType;
  onClick: () => void;
}

const ShortcutCard = ({ card, onClick }: ShortcutCardProps) => {
  return (
    <button
      type="button"
      className="relative overflow-hidden rounded-[10px] p-0 text-left active:scale-[0.99]"
      style={{ backgroundColor: palette.main[90] }}
      onClick={onClick}
    >
      <span className="absolute left-[12.5px] top-[18px] flex flex-col gap-1">
        <span className={font.caption.medium} style={{ color: lightTheme.primary.normal }}>
          {card.eyebrow}
        </span>
        <span className={font.headline2.semiBold} style={{ color: lightTheme.label.alternative }}>
          {card.title}
        </span>
      </span>
      <img
        src={card.imageSrc}
        alt={card.imageAlt}
        className={`pointer-events-none absolute object-contain ${card.imageClassName}`}
      />
    </button>
  );
};

interface RecommendationSectionProps {
  onMoreClick: () => void;
  onRecommendationClick: () => void;
}

const RecommendationSection = ({
  onMoreClick,
  onRecommendationClick,
}: RecommendationSectionProps) => {
  return (
    <section
      aria-labelledby="home-recommendation-title"
      className="mt-9 min-h-[328px] w-full pt-[15px]"
      style={{ backgroundColor: lightTheme.fill.normal }}
    >
      <div className="mx-auto flex w-[calc(100%_-_42px)] max-w-[360px] items-center justify-between">
        <h2
          id="home-recommendation-title"
          className={font.headline2.semiBold}
          style={{ color: lightTheme.label.alternative }}
        >
          AI 스타일 추천
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 border-0 bg-transparent p-0"
          style={{ color: lightTheme.label.assistive }}
          onClick={onMoreClick}
        >
          <span className={font.label.medium}>더보기</span>
          <img src={arrowIcon} alt="" className="size-[14px] rotate-180" />
        </button>
      </div>

      <div className="mx-auto mt-[14px] grid w-[calc(100%_-_42px)] max-w-[360px] grid-cols-2 gap-3">
        {RECOMMENDATION_CARDS.map(card => (
          <RecommendationCard key={card.id} card={card} onClick={onRecommendationClick} />
        ))}
      </div>
    </section>
  );
};

interface RecommendationCardProps {
  card: RecommendationCardType;
  onClick: () => void;
}

const RecommendationCard = ({ card, onClick }: RecommendationCardProps) => {
  return (
    <button
      type="button"
      className="h-[231px] overflow-hidden rounded-[12px] p-[8px] text-left shadow-[0_0_6px_rgba(0,0,0,0.02)] active:scale-[0.99]"
      style={{ backgroundColor: lightTheme.background.normal }}
      onClick={onClick}
    >
      <span className="flex h-full flex-col gap-4">
        <span className="relative block h-[95px] overflow-hidden rounded-[12px]">
          <CroppedHairImage alt={`${card.title} 추천 사진`} />
          <span
            aria-hidden="true"
            className="absolute bottom-[5px] right-[5px] flex size-[23px] items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(60,62,63,0.7)" }}
          >
            <img src={bookmarkIcon} alt="" className="size-[15px]" />
          </span>
        </span>

        <span className="flex flex-col gap-3">
          <span className="flex items-center gap-2">
            <span
              className={`${font.caption.semiBold} flex size-[18px] items-center justify-center rounded-full`}
              style={{
                backgroundColor: lightTheme.primary.normal,
                color: lightTheme.label.buttonText,
              }}
            >
              {card.rank}
            </span>
            <span
              className={`${font.body.bold} truncate`}
              style={{ color: lightTheme.label.neutral }}
            >
              {card.title}
            </span>
          </span>

          <span
            className="inline-flex h-5 w-fit items-center gap-[6px] rounded-[15px] border px-2"
            style={{
              backgroundColor: lightTheme.background.normal,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
          >
            <img src={colorDotIcon} alt="" className="h-3 w-[11px]" />
            <span className={font.caption.regular}>{card.colorName}</span>
          </span>

          <span className="flex flex-wrap gap-[5px]">
            {card.tags.map(tag => (
              <span
                key={tag}
                className={`${font.caption.medium} rounded-[5px] px-[6px] py-[2px]`}
                style={{
                  backgroundColor: lightTheme.fill.neutral,
                  color: lightTheme.label.alternative,
                }}
              >
                # {tag}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
};

interface CroppedHairImageProps {
  alt: string;
}

const CroppedHairImage = ({ alt }: CroppedHairImageProps) => {
  return (
    <span className="relative block size-full overflow-hidden rounded-[12px]">
      <img
        src={recentHairImage}
        alt={alt}
        className="absolute left-[0.3%] top-[-22%] h-[166%] w-full max-w-none object-cover"
      />
    </span>
  );
};

interface RatingStarsProps {
  rating: number;
}

const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <span aria-label={`평점 ${rating}점`} className="mt-px flex -space-x-[3px]">
      {Array.from({ length: 5 }, (_, index) => (
        <img key={index} src={starIcon} alt="" className="size-[15px]" />
      ))}
    </span>
  );
};

export default HomePage;

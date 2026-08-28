export interface ShortcutCardType {
  id: string;
  eyebrow: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName: string;
  to: string;
}

export interface RecommendationCardType {
  id: string;
  rank: number;
  title: string;
  colorName: string;
  tags: string[];
}

export interface RecentRecordType {
  date: string;
  procedureName: string;
  salonName: string;
  designerName: string;
  rating: number;
}

export interface LogoPartType {
  src: string;
  className: string;
}

export interface HomeHeaderProps {
  onProfileClick: () => void;
}

export interface RecentRecordCardProps {
  onClick: () => void;
}

export interface ShortcutCardProps {
  card: ShortcutCardType;
  onClick: () => void;
}

export interface RecommendationSectionProps {
  onMoreClick: () => void;
  onRecommendationClick: () => void;
}

export interface RecommendationCardProps {
  card: RecommendationCardType;
  onClick: () => void;
}

export interface CroppedHairImageProps {
  alt: string;
}

export interface RatingStarsProps {
  rating: number;
}

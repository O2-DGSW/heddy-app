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
  imageUrl: string;
  colorName: string;
  tags: string[];
}

export interface RecentRecordType {
  id: string;
  date: string;
  procedureName: string;
  salonName: string;
  designerName: string;
  rating: number;
  thumbnailUrl: string;
}

export interface LogoPartType {
  src: string;
  className: string;
}

export interface HomeHeaderProps {
  onProfileClick: () => void;
}

export interface RecentRecordCardProps {
  record?: RecentRecordType;
  isLoading?: boolean;
  isError?: boolean;
  onClick: () => void;
}

export interface ShortcutCardProps {
  card: ShortcutCardType;
  onClick: () => void;
}

export interface RecommendationSectionProps {
  recommendations: RecommendationCardType[];
  isLoading?: boolean;
  isError?: boolean;
  onMoreClick: () => void;
  onRecommendationClick: () => void;
}

export interface RecommendationCardProps {
  card: RecommendationCardType;
  onClick: () => void;
}

export interface CroppedHairImageProps {
  alt: string;
  src?: string;
}

export interface RatingStarsProps {
  rating: number;
}

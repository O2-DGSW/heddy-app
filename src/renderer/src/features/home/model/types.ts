export interface RecommendationCardType {
  id: string;
  rank: number;
  title: string;
  imageUrl: string;
  colorName: string;
  tags: string[];
  matchRate?: number;
}

export interface RecentRecordType {
  id: string;
  date: string;
  procedureName: string;
  salonName: string;
  designerName: string;
  rating: number;
  thumbnailUrl: string;
  colorName?: string;
  daysAgo?: string;
  memo?: string;
}

export interface RecentRecordCardProps {
  record?: RecentRecordType;
  isLoading?: boolean;
  isError?: boolean;
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

export interface ArStyleType {
  id: string;
  name: string;
  imageUrl: string;
}

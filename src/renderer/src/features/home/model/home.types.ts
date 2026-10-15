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

export interface ArStyleType {
  id: string;
  name: string;
  imageUrl: string;
}

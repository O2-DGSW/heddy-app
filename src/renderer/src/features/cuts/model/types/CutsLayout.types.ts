import type { HorizontalSwipeProps } from "@/shared";

export interface CutsLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** 콘텐츠 영역에서 좌우 스와이프로 탭을 넘기기 위한 제스처 핸들러 */
  contentSwipeProps?: HorizontalSwipeProps;
}

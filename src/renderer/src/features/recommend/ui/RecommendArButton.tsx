import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendChevronRightIcon } from "@/features/recommend/ui/icons/RecommendChevronRightIcon";

interface RecommendArButtonProps {
  hairstyleId?: string;
}

/** 카탈로그 ID를 전달하고, 실제 groom 선택은 AR 서버 목록과 대조한다. */
export const RecommendArButton = ({ hairstyleId }: RecommendArButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const search = hairstyleId ? `?${new URLSearchParams({ hairstyleId })}` : "";
    navigate(`/ar${search}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-center gap-0.5 rounded-full py-1.5 max-[400px]:py-1 ${font.label.semiBold} text-[0.8125rem] max-[400px]:text-[0.75rem]`}
      style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
    >
      AR로 체험
      <RecommendChevronRightIcon />
    </button>
  );
};

import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendChevronRightIcon } from "@/features/recommend/ui/icons/RecommendChevronRightIcon";

interface RecommendArButtonProps {
  groomName?: string | null;
}

/** 선택한 추천 스타일을 AR 화면에 전달한다. */
export const RecommendArButton = ({ groomName }: RecommendArButtonProps) => {
  const navigate = useNavigate();

  const canTryOn = Boolean(groomName && /^[a-z0-9][a-z0-9-]{0,79}$/.test(groomName));

  const handleClick = () => {
    if (!canTryOn || !groomName) return;
    navigate(`/ar?${new URLSearchParams({ groom: groomName })}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!canTryOn}
      className={`flex w-full items-center justify-center gap-0.5 rounded-full py-1.5 max-[400px]:py-1 ${font.label.semiBold} text-[0.8125rem] max-[400px]:text-[0.75rem]`}
      style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
    >
      {canTryOn ? "AR로 체험" : "AR 준비 중"}
      <RecommendChevronRightIcon />
    </button>
  );
};

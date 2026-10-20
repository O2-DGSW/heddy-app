import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendChevronRightIcon } from "@/features/recommend/ui/icons/RecommendChevronRightIcon";

interface RecommendArButtonProps {
  arGroomName?: string;
}

/** 백엔드가 명시적으로 연결한 groom만 전달한다. 스타일 이름으로 추측하지 않는다. */
export const RecommendArButton = ({ arGroomName }: RecommendArButtonProps) => {
  const navigate = useNavigate();
  const isAvailable = Boolean(arGroomName && /^[a-z0-9][a-z0-9-]{0,79}$/.test(arGroomName));

  const handleClick = () => {
    if (!isAvailable || !arGroomName) return;
    navigate(`/ar?${new URLSearchParams({ groom: arGroomName })}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAvailable}
      className={`flex w-full items-center justify-center gap-0.5 rounded-full py-1.5 disabled:cursor-not-allowed disabled:opacity-50 max-[400px]:py-1 ${font.label.semiBold} text-[0.8125rem] max-[400px]:text-[0.75rem]`}
      style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
    >
      {isAvailable ? "AR로 체험" : "AR 미지원"}
      <RecommendChevronRightIcon />
    </button>
  );
};

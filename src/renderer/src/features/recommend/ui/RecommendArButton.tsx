import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

import { RecommendChevronRightIcon } from "@/features/recommend/ui/icons/RecommendChevronRightIcon";

/** AR 헤어스타일 체험 탭(/ar)으로 이동한다 */
export const RecommendArButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/ar");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-center justify-center gap-1 rounded-full py-2.5 ${font.label.semiBold}`}
      style={{ backgroundColor: lightTheme.fill.neutral, color: lightTheme.label.neutral }}
    >
      AR로 체험
      <RecommendChevronRightIcon />
    </button>
  );
};

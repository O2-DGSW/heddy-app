import { setNavigation } from "@capgo/capacitor-transitions/react";
import { useLocation, useNavigate } from "react-router-dom";

import { arrowIcon } from "@/entities/record";
import { cn } from "@/shared/lib";

interface AuthBackButtonProps {
  className?: string;
  fallbackPath?: string;
  label?: string;
}

const AuthBackButton = ({
  className,
  fallbackPath = "/welcome",
  label = "뒤로 가기",
}: AuthBackButtonProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    setNavigation("back", "back");

    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  };

  return (
    <button
      aria-label={label}
      className={cn(
        "absolute left-6 top-[7px] z-20 flex h-11 w-11 items-center justify-start border-0 bg-transparent p-0 active:scale-[0.98]",
        className
      )}
      onClick={handleBack}
      type="button"
    >
      <img alt="" aria-hidden="true" className="h-[20px] w-[20px]" src={arrowIcon} />
    </button>
  );
};

export default AuthBackButton;

import { useNavigate } from "react-router-dom";

import { FloatingActionButton } from "@/shared";

export const CutsAddButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/cuts/add");
  };

  return (
    <FloatingActionButton onClick={handleClick} label="시술기록 추가">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </FloatingActionButton>
  );
};

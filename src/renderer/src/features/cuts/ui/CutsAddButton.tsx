import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { FloatingActionButton } from "@/shared";
import { CutsPlusIcon } from "@/features/cuts/ui/icons/CutsPlusIcon";

export const CutsAddButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    setDirection("forward");
    navigate("/cuts/add");
  };

  return (
    <FloatingActionButton onClick={handleClick} label="시술기록 추가">
      <CutsPlusIcon />
    </FloatingActionButton>
  );
};

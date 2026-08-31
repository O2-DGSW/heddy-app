import { useState } from "react";

import { HAIR_COLOR_OPTIONS, HAIRSTYLE_OPTIONS } from "./constants";
import type { ArModalType, HairstyleOptionId } from "./types";

export const useArHairstyle = () => {
  const [activeHairstylePosition, setActiveHairstylePosition] = useState(2);
  const [selectedColorId, setSelectedColorId] = useState<string>(HAIR_COLOR_OPTIONS[0].id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<ArModalType | null>(null);
  const [candidateMemo, setCandidateMemo] = useState("");

  const handleModalOpen = (modal: ArModalType) => {
    setActiveModal(modal);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleHairstyleSelect = (selectedId: HairstyleOptionId) => {
    const selectedIndex = HAIRSTYLE_OPTIONS.findIndex(option => option.id === selectedId);

    setActiveHairstylePosition(currentPosition => {
      const currentIndex =
        ((currentPosition % HAIRSTYLE_OPTIONS.length) + HAIRSTYLE_OPTIONS.length) %
        HAIRSTYLE_OPTIONS.length;
      const forwardDistance =
        (selectedIndex - currentIndex + HAIRSTYLE_OPTIONS.length) % HAIRSTYLE_OPTIONS.length;
      const movement =
        forwardDistance > HAIRSTYLE_OPTIONS.length / 2
          ? forwardDistance - HAIRSTYLE_OPTIONS.length
          : forwardDistance;

      return currentPosition + movement;
    });
  };

  const handleStyleReset = () => {
    handleHairstyleSelect("down-perm-2");
    setSelectedColorId(HAIR_COLOR_OPTIONS[0].id);
  };

  const handleExpandedToggle = () => {
    setIsExpanded(isCurrentExpanded => !isCurrentExpanded);
  };

  return {
    activeHairstylePosition,
    activeModal,
    candidateMemo,
    handleExpandedToggle,
    handleHairstyleSelect,
    handleModalClose,
    handleModalOpen,
    handleStyleReset,
    isExpanded,
    selectedColorId,
    setCandidateMemo,
    setSelectedColorId,
  };
};

import { useState } from "react";

import { DEFAULT_GROOM_FIT_SETTINGS, isValidGroomFitSettings } from "./arGroomFit";
import type {
  ArGroomFitSettings,
  ArHairstyleOption,
  ArModalType,
  HairstyleOptionId,
} from "./types";

export const useArHairstyle = (hairstyleOptions: ArHairstyleOption[]) => {
  const [activeHairstylePosition, setActiveHairstylePosition] = useState(0);
  const [fitSettings, setFitSettings] = useState<ArGroomFitSettings>(DEFAULT_GROOM_FIT_SETTINGS);
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
    const selectedIndex = hairstyleOptions.findIndex(option => option.id === selectedId);

    if (selectedIndex < 0 || hairstyleOptions.length === 0) {
      return;
    }

    setActiveHairstylePosition(currentPosition => {
      const currentIndex =
        ((currentPosition % hairstyleOptions.length) + hairstyleOptions.length) %
        hairstyleOptions.length;
      const forwardDistance =
        (selectedIndex - currentIndex + hairstyleOptions.length) % hairstyleOptions.length;
      const movement =
        forwardDistance > hairstyleOptions.length / 2
          ? forwardDistance - hairstyleOptions.length
          : forwardDistance;

      return currentPosition + movement;
    });
  };

  const handleStyleReset = () => {
    setActiveHairstylePosition(0);
    setFitSettings(DEFAULT_GROOM_FIT_SETTINGS);
  };

  const handleFitSettingsChange = (patch: Partial<ArGroomFitSettings>) => {
    setFitSettings(current => {
      const next = { ...current, ...patch };
      return isValidGroomFitSettings(next) ? next : current;
    });
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
    fitSettings,
    handleFitSettingsChange,
    setCandidateMemo,
  };
};

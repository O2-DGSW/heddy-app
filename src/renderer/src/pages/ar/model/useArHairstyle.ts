import { useCallback, useState } from "react";

import { DEFAULT_GROOM_FIT_SETTINGS, isValidGroomFitSettings } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import type { ArModalType } from "./ar.types";

export const useArHairstyle = (hairstyleOptions: ArHairstyleOption[]) => {
  const [activeHairstylePosition, setActiveHairstylePosition] = useState(0);
  const [fitSettings, setFitSettings] = useState<ArGroomFitSettings>(DEFAULT_GROOM_FIT_SETTINGS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<ArModalType | null>(null);
  const [candidateMemo, setCandidateMemo] = useState("");

  const handleGroomColorReset = useCallback(() => {
    setFitSettings(current =>
      current.groom_color === "" ? current : { ...current, groom_color: "" }
    );
  }, []);

  const handleModalOpen = (modal: ArModalType) => {
    setActiveModal(modal);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleHairstyleSelect = (selectedName: HairstyleOptionId) => {
    const selectedIndex = hairstyleOptions.findIndex(option => option.name === selectedName);

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
    handleGroomColorReset,
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

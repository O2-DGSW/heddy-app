import { useCallback, useState } from "react";

import { DEFAULT_GROOM_FIT_SETTINGS, isValidGroomFitSettings } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArHairstyleOption, HairstyleOptionId } from "@/entities/ar-groom";
import { DEFAULT_AR_HAIR_COLOR } from "./constants";

const getDefaultArFitSettings = (): ArGroomFitSettings => ({
  ...DEFAULT_GROOM_FIT_SETTINGS,
  groom_color: DEFAULT_AR_HAIR_COLOR,
});

export const useArHairstyle = (hairstyleOptions: ArHairstyleOption[]) => {
  const [activeHairstylePosition, setActiveHairstylePosition] = useState(0);
  const [fitSettings, setFitSettings] = useState<ArGroomFitSettings>(getDefaultArFitSettings);

  const handleGroomColorReset = useCallback(() => {
    setFitSettings(current =>
      current.groom_color === DEFAULT_AR_HAIR_COLOR
        ? current
        : { ...current, groom_color: DEFAULT_AR_HAIR_COLOR }
    );
  }, []);

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
    setFitSettings(getDefaultArFitSettings());
  };

  const handleFitSettingsChange = (patch: Partial<ArGroomFitSettings>) => {
    setFitSettings(current => {
      const next = { ...current, ...patch };
      return isValidGroomFitSettings(next) ? next : current;
    });
  };

  return {
    activeHairstylePosition,
    handleGroomColorReset,
    handleHairstyleSelect,
    handleStyleReset,
    fitSettings,
    handleFitSettingsChange,
  };
};

import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const triggerSelectionHaptic = () => {
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
};

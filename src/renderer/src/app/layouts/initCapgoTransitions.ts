import { initTransitions } from "@capgo/capacitor-transitions/react";
import "@capgo/capacitor-transitions";

let isCapgoTransitionsInitialized = false;

export const initCapgoTransitions = () => {
  if (isCapgoTransitionsInitialized) {
    return;
  }

  initTransitions({ platform: "auto" });
  isCapgoTransitionsInitialized = true;
};

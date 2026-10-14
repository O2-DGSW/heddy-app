import type { PreferredStyleTabType, StyleTagStatusType } from "../model/preferredStyle.types";

export const getIsTagDisabled = (status: StyleTagStatusType, activeTab: PreferredStyleTabType) => {
  if (activeTab === "preferred") {
    return status === "excluded";
  }

  return status === "preferred";
};

export const getNextTagStatus = (
  currentStatus: StyleTagStatusType,
  activeTab: PreferredStyleTabType
) => {
  if (currentStatus === activeTab) {
    return "none";
  }

  return activeTab;
};

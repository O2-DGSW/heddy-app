export type PreferredStyleTabType = "preferred" | "excluded";

export type StyleTagStatusType = "none" | "preferred" | "excluded";

export interface StyleTag {
  id: string;
  label: string;
  status: StyleTagStatusType;
}

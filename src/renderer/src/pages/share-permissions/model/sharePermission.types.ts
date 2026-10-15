export interface SharePermissionItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
  canToggle?: boolean;
}

export interface SharePermissionSection {
  id: string;
  title: string;
  items: SharePermissionItem[];
}

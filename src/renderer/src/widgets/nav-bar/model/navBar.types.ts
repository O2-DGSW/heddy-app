import type { ComponentType, SVGProps } from "react";

export type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type NavItem = {
  Icon: IconType;
  iconClassName?: string;
  title: string;
  to: string;
};

import { lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";
import type { ConnectionIconType } from "../../model/arConnectionContent";
import ArLoadingHairstyles from "../ArLoadingHairstyles";

interface ArConnectionIconProps {
  icon: ConnectionIconType;
  animated?: boolean;
}

const ArConnectionIcon = ({ icon, animated }: ArConnectionIconProps) => (
  <div
    aria-hidden="true"
    className="relative flex size-20 items-center justify-center rounded-full"
    style={{ backgroundColor: lightTheme.fill.normal, color: lightTheme.primary.normal }}
  >
    {icon === "loading" ? (
      <>
        <span className="absolute inset-0 rounded-full border-2 border-current opacity-15" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-current motion-reduce:animate-none" />
        <ArLoadingHairstyles />
      </>
    ) : (
      <svg
        className={cn("size-10", animated && "animate-pulse motion-reduce:animate-none")}
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "wifi" ? (
          <>
            <path d="M5 15a29 29 0 0 1 13-7m12 0a29 29 0 0 1 13 7M10 24a21 21 0 0 1 8-5m12 0a21 21 0 0 1 8 5M16 32l2-1m12 0 2 1M24 7v24" />
            <circle cx="24" cy="40" r="2" fill="currentColor" stroke="none" />
          </>
        ) : icon === "camera" ? (
          <>
            <path d="M15 12l3-5h12l3 5h6a4 4 0 0 1 4 4v21a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" />
            <circle cx="24" cy="26" r="8" />
          </>
        ) : (
          <>
            <rect x="7" y="9" width="34" height="30" rx="7" />
            <path d="M24 17v9" />
            <circle cx="24" cy="32" r="1.5" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    )}
  </div>
);

export default ArConnectionIcon;

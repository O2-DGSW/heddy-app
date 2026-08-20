import { lightTheme } from "@heddy/design-tokens";

interface CutsStarIconProps {
  filled: boolean;
}

export const CutsStarIcon = ({ filled }: CutsStarIconProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    className="h-3.5 w-3.5 max-[400px]:h-3 max-[400px]:w-3"
    fill={filled ? lightTheme.status.warning : lightTheme.line.neutral}
  >
    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.9l-5.21 2.6 1-5.79-4.21-4.1 5.82-.85z" />
  </svg>
);

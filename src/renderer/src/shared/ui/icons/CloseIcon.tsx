import { lightTheme } from "@heddy/design-tokens";

export const CutsCloseIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke={lightTheme.label.neutral}
    strokeWidth={2}
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

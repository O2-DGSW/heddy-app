import { lightTheme } from "@heddy/design-tokens";

interface CutsConfidenceRingProps {
  percent: number;
}

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CutsConfidenceRing = ({ percent }: CutsConfidenceRingProps) => {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 -rotate-90">
      <circle
        cx="24"
        cy="24"
        r={RADIUS}
        fill="none"
        stroke={lightTheme.fill.neutral}
        strokeWidth="4"
      />
      <circle
        cx="24"
        cy="24"
        r={RADIUS}
        fill="none"
        stroke={lightTheme.status.success}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

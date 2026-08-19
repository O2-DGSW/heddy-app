import { font, lightTheme } from "@heddy/design-tokens";

interface CutsAnalysisOverlayToggleProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
}

export const CutsAnalysisOverlayToggle = ({ label, isActive, onToggle }: CutsAnalysisOverlayToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isActive}
      className={`flex-1 rounded-xl py-3 text-center transition-colors duration-200 ${font.label.semiBold}`}
      style={{
        backgroundColor: isActive ? lightTheme.primary.normal : lightTheme.background.normal,
        color: isActive ? lightTheme.background.normal : lightTheme.label.alternative,
        border: isActive ? "none" : `1px solid ${lightTheme.line.neutral}`,
      }}
    >
      {label}
    </button>
  );
};

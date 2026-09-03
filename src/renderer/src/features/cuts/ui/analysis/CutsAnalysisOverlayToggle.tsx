import { font, lightTheme } from "@heddy/design-tokens";

interface CutsAnalysisOverlayToggleProps {
  label: string;
  isActive: boolean;
  /** 겹쳐 그릴 이미지가 없어 켤 수 없는 상태 */
  isDisabled?: boolean;
  onToggle: () => void;
}

export const CutsAnalysisOverlayToggle = ({
  label,
  isActive,
  isDisabled = false,
  onToggle,
}: CutsAnalysisOverlayToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={isActive}
      className={`flex-1 rounded-xl py-3 text-center transition-colors duration-200 disabled:opacity-50 ${font.label.semiBold}`}
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

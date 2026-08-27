import { lightTheme, palette } from "@heddy/design-tokens";

interface CutsShareItemToggleProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

export const CutsShareItemToggle = ({ label, checked, onToggle }: CutsShareItemToggleProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-label={`${label} ${checked ? "끄기" : "켜기"}`}
      className="relative h-[27px] w-[45px] shrink-0 rounded-[14px] border-0 p-0 transition-colors duration-200"
      style={{ backgroundColor: checked ? lightTheme.primary.normal : lightTheme.line.neutral }}
    >
      <span
        className="absolute top-1/2 h-[21px] w-[21px] -translate-y-1/2 rounded-full transition-[left] duration-200"
        style={{ left: checked ? "21px" : "3px", backgroundColor: palette.neutral[95] }}
      />
    </button>
  );
};

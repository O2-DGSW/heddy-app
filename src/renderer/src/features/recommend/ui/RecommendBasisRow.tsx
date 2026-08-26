import { font, lightTheme } from "@heddy/design-tokens";

interface RecommendBasisRowProps {
  label: string;
  value: string;
}

export const RecommendBasisRow = ({ label, value }: RecommendBasisRowProps) => {
  return (
    <div
      className="flex items-center justify-between border-b py-3 last:border-b-0"
      style={{ borderColor: lightTheme.line.alternative }}
    >
      <span className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
        {label}
      </span>
      <span className={font.label.semiBold} style={{ color: lightTheme.label.normal }}>
        {value}
      </span>
    </div>
  );
};

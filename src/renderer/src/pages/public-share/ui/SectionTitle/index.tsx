import { font, lightTheme } from "@heddy/design-tokens";

interface SectionTitleProps {
  children: string;
}

const SectionTitle = ({ children }: SectionTitleProps) => (
  <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
    {children}
  </h2>
);

export default SectionTitle;

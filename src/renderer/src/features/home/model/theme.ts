import type { CSSProperties } from "react";
import { lightTheme, palette } from "@heddy/design-tokens";

// Scope the existing design tokens to the home view without adding global CSS.
export const homeTheme: CSSProperties & Record<`--home-${string}`, string> = {
  "--home-surface": lightTheme.background.normal,
  "--home-background": lightTheme.background.neutral,
  "--home-text": lightTheme.label.neutral,
  "--home-secondary": lightTheme.label.alternative,
  "--home-muted": lightTheme.label.assistive,
  "--home-primary": lightTheme.primary.normal,
  "--home-soft": palette.main[90],
  "--home-share": palette.main[80],
  "--home-share-text": palette.main[40],
  "--home-line": lightTheme.fill.neutral,
  "--home-banner": lightTheme.line.alternative,
  "--home-note": lightTheme.label.buttonText,
};

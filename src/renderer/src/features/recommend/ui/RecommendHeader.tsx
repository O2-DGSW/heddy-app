import { font, lightTheme } from "@heddy/design-tokens";

export const RecommendHeader = () => {
  return (
    <header
      className="flex h-[58px] shrink-0 items-center justify-center"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <h1
        className={font.headline1.bold}
        id="recommend-title"
        style={{ color: lightTheme.label.neutral }}
      >
        스타일 추천
      </h1>
    </header>
  );
};

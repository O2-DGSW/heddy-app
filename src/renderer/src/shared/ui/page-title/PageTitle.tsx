import type { ReactNode } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

interface PageTitleProps {
  children: ReactNode;
  id?: string;
}

/** 페이지 최상단 타이틀(h1) 공통 컴포넌트 — 페이지마다 스타일이 따로 놀지 않도록 여기서만 관리한다. */
export const PageTitle = ({ children, id }: PageTitleProps) => {
  return (
    <h1
      className={`shrink-0 py-2 pt-3 text-center ${font.headline1.bold}`}
      id={id}
      style={{ color: lightTheme.label.neutral, backgroundColor: lightTheme.background.normal }}
    >
      {children}
    </h1>
  );
};

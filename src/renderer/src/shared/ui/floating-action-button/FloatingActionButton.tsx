import type { ReactNode } from "react";
import { lightTheme } from "@heddy/design-tokens";

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  children: ReactNode;
}

export const FloatingActionButton = ({ onClick, label, children }: FloatingActionButtonProps) => {
  return (
    // NavBar 실제 높이(콘텐츠 + 기기별 세이프에어리어)는 global.css의 --nav-bar-height로
    // 관리한다. 여기서 다시 safe-area-inset-bottom을 더하면 그만큼 간격이 겹으로 벌어진다.
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[var(--nav-bar-height)] right-4 flex h-14 w-14 items-center justify-center rounded-full border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.background.normal }}
    >
      {children}
    </button>
  );
};

import type { ReactNode } from "react";
import { lightTheme } from "@heddy/design-tokens";

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  children: ReactNode;
}

export const FloatingActionButton = ({ onClick, label, children }: FloatingActionButtonProps) => {
  return (
    // NavBar는 높이가 106px로 고정이고 세이프에어리어만큼 커지지 않아서, 여기서도
    // safe-area-inset-bottom을 더하면 안 된다 — 더하면 노치/홈 인디케이터가 있는
    // 기기에서 NavBar와의 간격이 그만큼 불필요하게 벌어진다.
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[116px] right-4 flex h-14 w-14 items-center justify-center rounded-full border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.background.normal }}
    >
      {children}
    </button>
  );
};

import type { ReactNode } from "react";
import { lightTheme } from "@heddy/design-tokens";

interface FloatingActionButtonProps {
  onClick: () => void;
  label: string;
  children: ReactNode;
}

export const FloatingActionButton = ({ onClick, label, children }: FloatingActionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(116px+var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] right-4 flex h-14 w-14 items-center justify-center rounded-full border-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.background.normal }}
    >
      {children}
    </button>
  );
};

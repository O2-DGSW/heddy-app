import { font } from "@heddy/design-tokens";

import type { IconType } from "../model/types";

interface BarItemProps {
    Icon: IconType;
    isActive: boolean;
    title: string;
    iconColor: string;
    backgroundColor: string;
    textColor: string;
    onClick: () => void;
}

export const BarItem = ({
                            Icon,
                            isActive,
                            title,
                            iconColor,
                            backgroundColor,
                            textColor,
                            onClick,
}: BarItemProps) => {
    return (
        <button
            aria-current={isActive ? "page" : undefined}
            aria-label={title}
            className="flex min-h-[3.5rem] min-w-[2.75rem] shrink-0 justify-center border-0 bg-transparent p-0"
            onClick={onClick}
            type="button"
        >
            <div className="flex flex-col items-center gap-[0.25rem]">
                <div
                    className="flex h-[2rem] w-[2rem] items-center justify-center rounded-lg"
                    style={{ backgroundColor }}
                >
                    <Icon
                        aria-hidden="true"
                        className="h-[2rem] w-[2rem]"
                        style={{ color: iconColor }}
                    />
                </div>

                <p className={font.caption.medium} style={{ color: textColor }}>
                    {title}
                </p>
            </div>
        </button>
    );
};

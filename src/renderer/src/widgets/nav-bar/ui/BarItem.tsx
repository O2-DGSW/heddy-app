import { font } from "@heddy/design-tokens";

import type { IconType } from "../model/types";

interface BarItemProps {
    Icon: IconType;
    title: string;
    iconColor: string;
    backgroundColor: string;
    textColor: string;
    onClick: () => void;
}

export const BarItem = ({
                            Icon,
                            title,
                            iconColor,
                            backgroundColor,
                            textColor,
                            onClick,
                        }: BarItemProps) => {
    return (
        <button className="w-[90%]" onClick={onClick}>
            <div className="flex flex-col items-center gap-[0.25rem]">
                <div className="p-[0.2rem] rounded-lg" style={{ backgroundColor }}>
                    <Icon
                        aria-hidden="true"
                        className="w-[2.1875rem] h-[2.125rem]"
                        style={{ color: iconColor }}
                    />
                </div>

                <p className={font.label.medium} style={{ color: textColor }}>
                    {title}
                </p>
            </div>
        </button>
    );
};

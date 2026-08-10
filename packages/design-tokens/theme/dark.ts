import type { Theme } from "./types";

export const darkTheme: Theme = {
    primary: {
        normal: "#41BE8E",
    },
    label: {
        normal: "#F5F5F5",
        strong: "#FFFFFF",
        neutral: "#DCDDDE",
        alternative: "#C4C5C6",
        assistive: "#9C9D9F",
        inactive: "#9C9D9F",
        disable: "#3C3E3F",
        buttonText: "#0C0C0D",
    },
    line: {
        normal: "#747678",
        neutral: "#48494A",
        alternative: "#383A3B",
    },
    fill: {
        normal: "#2A2B2C",
        neutral: "#383A3B",
        alternative: "#48494A",
    },
    background: {
        normal: "#2A2B2C",
        neutral: "#4D4F51",
        alternative: "#303234",
    },
    status: {
        error: "#EE2A2B",
        info:"#1A97FF",
        success: "#31E87A",
        warning: "#FFD11A",
    }
};

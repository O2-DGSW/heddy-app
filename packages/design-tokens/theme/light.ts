import type { Theme } from "./types";

export const lightTheme: Theme = {
  primary: {
    normal: "#41BE8E",
  },
  label: {
    normal: "#0C0C0D",
    strong: "#000000",
    neutral: "#3C3E3F",
    alternative: "#5A5C5D",
    assistive: "#76787A",
    inactive: "#999999",
    disable: "#E6E6E7",
    buttonText: "#F5F5F5",
  },
  line: {
    normal: "#C1C2C3",
    neutral: "#DADBDC",
    alternative: "#E8E8E9",
  },
  fill: {
    normal: "#F7F7F7",
    neutral: "#E6E6E7",
    alternative: "#DDDEDF",
  },
  background: {
    normal: "#FFFFFF",
    neutral: "#F7F7F7",
    alternative: "#FAFAFA",
  },
  status: {
    error: "#EE2A2B",
    info: "#1A97FF",
    success: "#31E87A",
    warning: "#FFD11A",
  },
};

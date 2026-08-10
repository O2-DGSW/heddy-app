import type { Font } from "./types";

const COMMON = "leading-[1.3] tracking-[-0.02em]";

export const font = {
    display1: {
        bold: `text-[2.25rem] font-bold ${COMMON}`,
        semiBold: `text-[2.25rem] font-semibold ${COMMON}`,
        medium: `text-[2.25rem] font-medium ${COMMON}`,
        regular: `text-[2.25rem] font-normal ${COMMON}`,
    },

    display2: {
        bold: `text-[2rem] font-bold ${COMMON}`,
        semiBold: `text-[2rem] font-semibold ${COMMON}`,
        medium: `text-[2rem] font-medium ${COMMON}`,
        regular: `text-[2rem] font-normal ${COMMON}`,
    },

    title1: {
        bold: `text-[1.75rem] font-bold ${COMMON}`,
        semiBold: `text-[1.75rem] font-semibold ${COMMON}`,
        medium: `text-[1.75rem] font-medium ${COMMON}`,
        regular: `text-[1.75rem] font-normal ${COMMON}`,
    },

    title2: {
        bold: `text-[1.5rem] font-bold ${COMMON}`,
        semiBold: `text-[1.5rem] font-semibold ${COMMON}`,
        medium: `text-[1.5rem] font-medium ${COMMON}`,
        regular: `text-[1.5rem] font-normal ${COMMON}`,
    },

    headline1: {
        bold: `text-[1.25rem] font-bold ${COMMON}`,
        semiBold: `text-[1.25rem] font-semibold ${COMMON}`,
        medium: `text-[1.25rem] font-medium ${COMMON}`,
        regular: `text-[1.25rem] font-normal ${COMMON}`,
    },

    headline2: {
        bold: `text-[1.125rem] font-bold ${COMMON}`,
        semiBold: `text-[1.125rem] font-semibold ${COMMON}`,
        medium: `text-[1.125rem] font-medium ${COMMON}`,
        regular: `text-[1.125rem] font-normal ${COMMON}`,
    },

    body: {
        bold: `text-[1rem] font-bold ${COMMON}`,
        semiBold: `text-[1rem] font-semibold ${COMMON}`,
        medium: `text-[1rem] font-medium ${COMMON}`,
        regular: `text-[1rem] font-normal ${COMMON}`,
    },

    label: {
        bold: `text-[0.875rem] font-bold ${COMMON}`,
        semiBold: `text-[0.875rem] font-semibold ${COMMON}`,
        medium: `text-[0.875rem] font-medium ${COMMON}`,
        regular: `text-[0.875rem] font-normal ${COMMON}`,
    },

    caption: {
        bold: `text-[0.75rem] font-bold ${COMMON}`,
        semiBold: `text-[0.75rem] font-semibold ${COMMON}`,
        medium: `text-[0.75rem] font-medium ${COMMON}`,
        regular: `text-[0.75rem] font-normal ${COMMON}`,
    },
} as const satisfies Font;
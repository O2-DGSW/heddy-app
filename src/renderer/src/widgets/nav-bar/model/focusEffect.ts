import { lightTheme } from "@heddy/design-tokens";

export const getBarItemState = (currentPath: string, targetPath: string) => {
  const isActive =
    currentPath === targetPath || (targetPath !== "/" && currentPath.startsWith(`${targetPath}/`));

  return {
    isActive,

    iconColor: isActive ? lightTheme.background.normal : lightTheme.line.normal,

    backgroundColor: isActive ? lightTheme.primary.normal : "transparent",

    textColor: isActive ? lightTheme.primary.normal : lightTheme.line.normal,
  };
};

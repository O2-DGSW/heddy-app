import { createContext, useContext, type Dispatch, type SetStateAction } from "react";

interface BottomBarVisibilityContextValue {
  isBottomBarHidden: boolean;
  setIsBottomBarHidden: Dispatch<SetStateAction<boolean>>;
}

const BottomBarVisibilityContext = createContext<BottomBarVisibilityContextValue | null>(null);

const useBottomBarVisibility = () => {
  const context = useContext(BottomBarVisibilityContext);

  if (!context) {
    throw new Error(
      "useBottomBarVisibility는 BottomBarVisibilityProvider 내부에서 사용해야 합니다."
    );
  }

  return context;
};

export { BottomBarVisibilityContext, useBottomBarVisibility };

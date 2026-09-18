import { createContext, useContext, useEffect, type Dispatch, type SetStateAction } from "react";

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

/**
 * 바텀시트가 열려 있는 동안 하단 탭바를 내린다.
 * 탭바가 시트보다 나중에 그려져서 확인 버튼을 덮기 때문에, 시트 쪽에서 직접 내려 줘야 한다.
 */
const useHideBottomBarWhileOpen = (isOpen: boolean) => {
  const { setIsBottomBarHidden } = useBottomBarVisibility();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setIsBottomBarHidden(true);

    return () => {
      setIsBottomBarHidden(false);
    };
  }, [isOpen, setIsBottomBarHidden]);
};

export { BottomBarVisibilityContext, useBottomBarVisibility, useHideBottomBarWhileOpen };

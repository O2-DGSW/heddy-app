import { useMemo, useState, type ReactNode } from "react";

import { BottomBarVisibilityContext } from "../../model/bottom-bar-visibility";

interface BottomBarVisibilityProviderProps {
  children: ReactNode;
}

const BottomBarVisibilityProvider = ({ children }: BottomBarVisibilityProviderProps) => {
  const [isBottomBarHidden, setIsBottomBarHidden] = useState(false);
  const value = useMemo(() => ({ isBottomBarHidden, setIsBottomBarHidden }), [isBottomBarHidden]);

  return (
    <BottomBarVisibilityContext.Provider value={value}>
      {children}
    </BottomBarVisibilityContext.Provider>
  );
};

export default BottomBarVisibilityProvider;

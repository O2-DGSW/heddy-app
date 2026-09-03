import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { restoreAuthSession } from "@/entities/auth";

type AuthStatusType = "checking" | "authenticated" | "unauthenticated";

const useAuthStatus = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatusType>("checking");

  useEffect(() => {
    let isMounted = true;

    void restoreAuthSession().then(isAuthenticated => {
      if (!isMounted) {
        return;
      }

      setAuthStatus(isAuthenticated ? "authenticated" : "unauthenticated");
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return authStatus;
};

export const RequireAuth = () => {
  const location = useLocation();
  const authStatus = useAuthStatus();

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate replace to="/welcome" state={{ from: location }} />;
  }

  return <Outlet />;
};

export const RequireGuest = () => {
  const authStatus = useAuthStatus();

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus === "authenticated") {
    return <Navigate replace to="/home" />;
  }

  return <Outlet />;
};

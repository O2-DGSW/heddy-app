import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getAccessToken } from "@/entities/auth";
import { getMyProfileApi, profileQueryKeys } from "@/entities/profile";

export const useProfile = () => {
  const [accessToken, setAccessToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    void getAccessToken().then(token => {
      if (isMounted) {
        setAccessToken(token);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return useQuery({
    queryKey: profileQueryKeys.mine(),
    queryFn: () => getMyProfileApi(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
};

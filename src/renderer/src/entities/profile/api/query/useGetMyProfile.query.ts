import { useQuery } from "@tanstack/react-query";

import { profileQueryKeys } from "@/entities";
import { getMyProfileApi } from "@/entities";

export const useGetMyProfile = () =>
  useQuery({
    queryKey: profileQueryKeys.mine(),
    queryFn: getMyProfileApi,
  });

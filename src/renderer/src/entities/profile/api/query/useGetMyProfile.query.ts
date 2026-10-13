import { useQuery } from "@tanstack/react-query";

import { profileQueryKeys } from "../../model/queryKeys";
import { getMyProfileApi } from "../profileApi";

export const useGetMyProfile = () =>
  useQuery({
    queryKey: profileQueryKeys.mine(),
    queryFn: getMyProfileApi,
  });

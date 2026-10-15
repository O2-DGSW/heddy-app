import { useQuery } from "@tanstack/react-query";

import { getStyleTagsApi } from "../styleApi";
import { styleQueryKeys } from "./styleQueryKeys";

export const useGetStyleTags = () =>
  useQuery({
    queryKey: styleQueryKeys.tags(),
    queryFn: getStyleTagsApi,
  });

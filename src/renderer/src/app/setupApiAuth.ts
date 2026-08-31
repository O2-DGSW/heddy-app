import { getAccessToken } from "@/entities/auth";
import { setAccessTokenGetter } from "@/shared/lib/api";

export const setupApiAuth = () => {
  setAccessTokenGetter(getAccessToken);
};

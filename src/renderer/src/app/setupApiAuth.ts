import { getAccessToken } from "@/entities/auth";
import { api } from "@/shared/lib/api";

let isApiAuthSetup = false;

export const setupApiAuth = () => {
  if (isApiAuthSetup) {
    return;
  }

  api.interceptors.request.use(async config => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  });

  isApiAuthSetup = true;
};

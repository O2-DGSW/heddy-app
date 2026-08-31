import { setAccessTokenGetter } from "@/shared/lib/api";
import { getAccessToken } from "@/entities";

/**
 * axios 요청에 액세스 토큰을 붙이도록 연결한다.
 * shared(api)가 entities(토큰 저장소)를 직접 참조하지 않도록, 두 레이어를 모두 알 수 있는 app에서 주입한다.
 */
export const setupApiAuth = () => {
  setAccessTokenGetter(getAccessToken);
};

import { BrowserRouter } from "react-router-dom";
import { AppPermissionNotice } from "@/features/permission-notice";
import { env } from "@/shared/config";

import { AppRoutes } from "./routes";
import SessionExpiryListener from "./SessionExpiryListener";

/** 웹 배포는 `heddy.site/mobile` 하위 경로라 라우트 앞에 base를 붙인다(네이티브는 `/` → 없음) */
const ROUTER_BASENAME = env.baseUrl.replace(/\/$/, "") || undefined;

const App = () => (
  <BrowserRouter basename={ROUTER_BASENAME}>
    <SessionExpiryListener />
    <AppRoutes />
    {/* 앱 첫 실행 때 접근권한을 한 번 안내한다(네이티브만). 화면 위에 덮어 먼저 읽게 한다 */}
    <AppPermissionNotice />
  </BrowserRouter>
);

export default App;

import { BrowserRouter } from "react-router-dom";
import { env } from "@/shared/config";

import { AppRoutes } from "./routes";
import SessionExpiryListener from "./SessionExpiryListener";
import MaintenanceGate from "./MaintenanceGate";

/** 웹 배포는 `heddy.site/mobile` 하위 경로라 라우트 앞에 base를 붙인다(네이티브는 `/` → 없음) */
const ROUTER_BASENAME = env.baseUrl.replace(/\/$/, "") || undefined;

const App = () => (
  <BrowserRouter basename={ROUTER_BASENAME}>
    <MaintenanceGate>
      <SessionExpiryListener />
      <AppRoutes />
    </MaintenanceGate>
  </BrowserRouter>
);

export default App;

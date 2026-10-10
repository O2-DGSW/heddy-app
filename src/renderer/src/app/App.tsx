// import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { setupApiAuth } from "./setupApiAuth";
// import { restoreAuthSession } from "@/entities/auth/model/session";
// import { setupInterceptor } from "@/private/shared/api/interceptor";

setupApiAuth();

/** 웹 배포는 `heddy.site/mobile` 하위 경로라 라우트 앞에 base를 붙인다(네이티브는 `/` → 없음) */
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;
// const shouldRestoreAuthSession = () => {
//     if (typeof window === "undefined") {
//         return false;
//     }
//
//     return (
//         !["/login", "/signup"].includes(window.location.pathname) &&
//         !window.location.pathname.startsWith("/find/")
//     );
// };

const App = () => {
  // useEffect(() => {
  //     if (!shouldRestoreAuthSession()) {
  //         return;
  //     }
  //
  //     void restoreAuthSession();
  // }, []);

  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;

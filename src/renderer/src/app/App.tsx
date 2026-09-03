// import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { setupApiAuth } from "./setupApiAuth";
import { ToastProvider } from "@/shared";
// import { restoreAuthSession } from "@/entities/auth/model/session";
// import { setupInterceptor } from "@/private/shared/api/interceptor";

setupApiAuth();
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
    <BrowserRouter>
      <AppRoutes />
      <ToastProvider />
    </BrowserRouter>
  );
};

export default App;

// import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
// import { restoreAuthSession } from "@/entities/auth/model/session";
// import { setupInterceptor } from "@/private/shared/api/interceptor";

// setupInterceptor();
//
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
        </BrowserRouter>
    );
};

export default App;
// import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MobileLayout } from "./layouts";
import { RecordAddPage } from "../pages/record-add";
import { RecordAdd2Page } from "../pages/record-add2";
import {LoginPage} from "../pages/auth/login/ui/LoginPage.tsx";
import { CutsListPage } from "../pages/cuts";

// type AuthStatus = "checking" | "authenticated" | "unauthenticated";
//
// const RequireAuth = () => {
//     const location = useLocation();
//     const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
//
//     useEffect(() => {
//         let isMounted = true;
//
//         void restoreAuthSession().then(isAuthenticated => {
//             if (!isMounted) {
//                 return;
//             }
//
//             setAuthStatus(isAuthenticated ? "authenticated" : "unauthenticated");
//         });
//
//         return () => {
//             isMounted = false;
//         };
//     }, []);
//
//     if (authStatus === "checking") {
//         return null;
//     }
//
//     if (authStatus === "unauthenticated") {
//         return <Navigate replace to="/login" state={{ from: location }} />;
//     }
//
//     return <Outlet />;
// };

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/cuts" element={<CutsListPage />} />
        <Route path="/cuts/add" element={<RecordAddPage />} />
        <Route path="/cuts/add2" element={<RecordAdd2Page />} />
        <Route path="*" element={<>안녕</>} />
        <Route path="/login" element={<LoginPage />} />
        {/*<Route path="/signup" element={<SignupPage />} />*/}
        {/*<Route path="/find/:type" element={<FindPage />} />*/}

        {/*<Route element={<RequireAuth />}>*/}
        {/*    <Route path="/" element={<MainPage />} />*/}
        {/*    <Route path="/profile/*" element={<ProfilePage />} />*/}
        {/*    <Route path="/cuts/add" element={<AddProcedureNotePage />} />*/}
        {/*    <Route path="/cuts/customer-search" element={<CustomerSearchPage />} />*/}
        {/*    <Route path="/cuts/*" element={<ProcedureNotePage />} />*/}
        {/*    <Route path="/reservation" element={<ReservationPage />} />*/}
        {/*    <Route path="/shop/*" element={<ShopPage />} />*/}
        {/*    <Route path="/ai-style-recommendation" element={<AiStyleRecommendationListPage />} />*/}
        {/*    <Route*/}
        {/*        path="/ai-style-recommendation/detail"*/}
        {/*        element={<AiStyleRecommendationDetailPage />}*/}
        {/*    />*/}
        {/*    <Route path="*" element={<Navigate replace to="/" />} />*/}
        {/*</Route>*/}
      </Route>
    </Routes>
  );
};

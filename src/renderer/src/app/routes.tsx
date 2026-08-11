// import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MobileLayout } from "./layouts";
import { CutsListPage } from "@/pages/cuts";

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
        <Route path="/" element={<Navigate replace to="/cuts" />} />
        <Route path="/cuts" element={<CutsListPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
        {/*<Route path="/login" element={<LoginPage />} />*/}
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

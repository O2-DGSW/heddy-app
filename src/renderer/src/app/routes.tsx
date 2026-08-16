import { Navigate, Route, Routes } from "react-router-dom";

import { MobileLayout } from "./layouts";
import { CutsListPage } from "@/pages/cuts";
import { WelcomePage } from "@/pages/auth/welcome";
import { LoginPage } from "@/pages/auth/login";
import { PreferredStyleRegistrationPage } from "@/pages/preferred-style-registration";
import { SignupPage } from "@/pages/auth/signup";
import { RecordAddPage } from "@/pages/record-add";

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
        <Route path="/cuts/add" element={<RecordAddPage />} />
        <Route path="/profile/preferred-style" element={<PreferredStyleRegistrationPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
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
        <Route path="*" element={<>404p</>} />
      </Route>
    </Routes>
  );
};

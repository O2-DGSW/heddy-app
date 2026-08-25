import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MobileLayout } from "./layouts";
import { getRefreshToken } from "@/entities/auth";
import { CutsListPage } from "@/pages/cuts";
import { CutsDetailPage, CutsDetailInfoPage, CutsDetailAnalysisPage } from "@/pages/cuts-detail";
import { WelcomePage } from "@/pages/auth/welcome";
import { LoginPage } from "@/pages/auth/login";
import { PreferredStyleRegistrationPage } from "@/pages/preferred-style-registration";
import { SignupPage } from "@/pages/auth/signup";
import { RecordAddPage } from "@/pages/record-add";
import { FindPage } from "@/pages/auth/find";
import { SharePermissionsPage } from "@/pages/share-permissions";

type EntryStatusType = "checking" | "authenticated" | "unauthenticated";

const EntryRedirect = () => {
  const [entryStatus, setEntryStatus] = useState<EntryStatusType>("checking");

  useEffect(() => {
    let isMounted = true;

    void getRefreshToken()
      .then(refreshToken => {
        if (!isMounted) {
          return;
        }

        setEntryStatus(refreshToken ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setEntryStatus("unauthenticated");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (entryStatus === "checking") {
    return null;
  }

  return <Navigate replace to={entryStatus === "authenticated" ? "/home" : "/welcome"} />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route path="/" element={<EntryRedirect />} />
        <Route path="/home" element={<div />} />
        <Route path="/cuts" element={<CutsListPage />} />
        <Route path="/cuts/add" element={<RecordAddPage />} />
        <Route path="/cuts/:id" element={<CutsDetailPage />}>
          <Route index element={<Navigate replace to="info" />} />
          <Route path="info" element={<CutsDetailInfoPage />} />
          <Route path="analysis" element={<CutsDetailAnalysisPage />} />
        </Route>
        <Route path="/profile" element={<SharePermissionsPage />} />
        <Route path="/profile/share-permissions" element={<SharePermissionsPage />} />
        <Route path="/profile/preferred-style" element={<PreferredStyleRegistrationPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/find-id" element={<FindPage />} />
        <Route path="/find-password" element={<FindPage />} />

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

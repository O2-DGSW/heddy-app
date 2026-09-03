import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import { AuthTransitionOutlet, MobileLayout, MainTransitionOutlet } from "./layouts";
import { RequireAuth, RequireGuest } from "./routes/AuthRouteGuard";
import { restoreAuthSession } from "@/entities/auth";
import { CutsListPage } from "@/pages/cuts";
import { CutsDetailPage, CutsDetailInfoPage, CutsDetailAnalysisPage } from "@/pages/cuts-detail";
import { CutsSharePage } from "@/pages/cuts-share";
import { WelcomePage } from "@/pages/auth/welcome";
import { LoginPage } from "@/pages/auth/login";
import { PreferredStyleRegistrationPage } from "@/pages/preferred-style-registration";
import { SignupPage } from "@/pages/auth/signup";
import { RecordAddPage } from "@/pages/record-add";
import { RecordEditPage } from "@/pages/record-edit";
import { FindPage } from "@/pages/auth/find";
import { ArHairstylePage } from "@/pages/ar";
import { RecommendPage } from "@/pages/recommend";
import { SavedStylesPage } from "@/pages/saved-styles";
import { SharePermissionsPage } from "@/pages/share-permissions";
import { ProfilePage } from "@/pages/profile";
import { HomePage } from "@/pages/home";
import { PublicSharePage } from "@/pages/public-share";

type EntryStatusType = "checking" | "authenticated" | "unauthenticated";

const EntryRedirect = () => {
  const [entryStatus, setEntryStatus] = useState<EntryStatusType>("checking");

  useEffect(() => {
    let isMounted = true;

    void restoreAuthSession()
      .then(isAuthenticated => {
        if (!isMounted) {
          return;
        }

        setEntryStatus(isAuthenticated ? "authenticated" : "unauthenticated");
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
      {/* 공유 링크로 들어온 사람이 로그인 없이 보는 웹 화면이라 앱 셸 밖에 둔다 */}
      <Route path="/s/:shareToken" element={<PublicSharePage />} />
      <Route element={<MobileLayout />}>
        <Route path="/" element={<EntryRedirect />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainTransitionOutlet />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/ar" element={<ArHairstylePage />} />
            <Route path="/recommend" element={<RecommendPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cuts" element={<CutsListPage />} />
            <Route path="/cuts/add" element={<RecordAddPage />} />
            <Route path="/cuts/:id" element={<CutsDetailPage />}>
              <Route index element={<Navigate replace to="info" />} />
              <Route path="info" element={<CutsDetailInfoPage />} />
              <Route path="analysis" element={<CutsDetailAnalysisPage />} />
            </Route>
            <Route path="/cuts/:id/edit" element={<RecordEditPage />} />
            <Route path="/cuts/:id/share" element={<CutsSharePage />} />
          </Route>
          <Route path="/profile/share-permissions" element={<SharePermissionsPage />} />
          <Route path="/profile/preferred-style" element={<PreferredStyleRegistrationPage />} />
          <Route path="/profile/saved-styles" element={<SavedStylesPage />} />
          <Route path="*" element={<>404p</>} />
        </Route>
        <Route element={<RequireGuest />}>
          <Route element={<AuthTransitionOutlet />}>
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-id" element={<FindPage />} />
            <Route path="/find-password" element={<FindPage />} />
          </Route>
        </Route>

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

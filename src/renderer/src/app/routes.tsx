import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";

import type { ComponentType } from "react";

import { AuthTransitionOutlet, MobileLayout, MainTransitionOutlet } from "./layouts";
import { RequireAuth, RequireGuest } from "./routes/AuthRouteGuard";
import { restoreAuthSession } from "@/entities/auth";
// 앱을 열면 바로 보이는 화면은 첫 번들에 둔다. 나머지는 처음 들어갈 때 불러온다.
import { WelcomePage } from "@/pages/auth/welcome";
import { LoginPage } from "@/pages/auth/login";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import { PageLoading } from "@/shared";

/** 화면 단위로 나눠 불러온다. 불러오는 동안 레이아웃·하단 바는 그대로 두고 그 화면 자리만 비운다 */
const lazyPage = <TModule,>(
  load: () => Promise<TModule>,
  pick: (module: TModule) => ComponentType
): ComponentType => {
  const Page = lazy(() => load().then(module => ({ default: pick(module) })));

  const SuspendedPage = () => (
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  );

  return SuspendedPage;
};

const CutsListPage = lazyPage(
  () => import("@/pages/cuts"),
  m => m.CutsListPage
);
const CutsDetailPage = lazyPage(
  () => import("@/pages/cuts-detail"),
  m => m.CutsDetailPage
);
const CutsDetailInfoPage = lazyPage(
  () => import("@/pages/cuts-detail"),
  m => m.CutsDetailInfoPage
);
const CutsDetailAnalysisPage = lazyPage(
  () => import("@/pages/cuts-detail"),
  m => m.CutsDetailAnalysisPage
);
const CutsSharePage = lazyPage(
  () => import("@/pages/cuts-share"),
  m => m.CutsSharePage
);
const PreferredStyleRegistrationPage = lazyPage(
  () => import("@/pages/preferred-style-registration"),
  m => m.PreferredStyleRegistrationPage
);
const SignupPage = lazyPage(
  () => import("@/pages/auth/signup"),
  m => m.SignupPage
);
const RecordAddPage = lazyPage(
  () => import("@/pages/record-add"),
  m => m.RecordAddPage
);
const RecordEditPage = lazyPage(
  () => import("@/pages/record-edit"),
  m => m.RecordEditPage
);
const FindPage = lazyPage(
  () => import("@/pages/auth/find"),
  m => m.FindPage
);
const ArHairstylePage = lazyPage(
  () => import("@/pages/ar"),
  m => m.ArHairstylePage
);
const RecommendPage = lazyPage(
  () => import("@/pages/recommend"),
  m => m.RecommendPage
);
const SavedStylesPage = lazyPage(
  () => import("@/pages/saved-styles"),
  m => m.SavedStylesPage
);
const SharePermissionsPage = lazyPage(
  () => import("@/pages/share-permissions"),
  m => m.SharePermissionsPage
);
const ProfilePage = lazyPage(
  () => import("@/pages/profile"),
  m => m.ProfilePage
);
const ProfileEditPage = lazyPage(
  () => import("@/pages/profile-edit"),
  m => m.ProfileEditPage
);
const PublicSharePage = lazyPage(
  () => import("@/pages/public-share"),
  m => m.PublicSharePage
);

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
    return <PageLoading />;
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
            <Route path="/profile/edit" element={<ProfileEditPage />} />
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
          <Route path="*" element={<NotFoundPage />} />
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
      </Route>
    </Routes>
  );
};

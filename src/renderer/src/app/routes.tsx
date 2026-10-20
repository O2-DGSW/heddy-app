import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { matchQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState } from "react";

import type { ComponentType } from "react";

import { AuthTransitionOutlet, MobileLayout, MainTransitionOutlet } from "./layouts";
import { RequireAuth, RequireGuest } from "./routes/AuthRouteGuard";
import { getAccessToken, restoreAuthSession } from "@/entities/auth";
import { generateRecommendationApi, recommendationQueryKeys } from "@/entities/recommendation";
// 앱을 열면 바로 보이는 화면은 첫 번들에 둔다. 나머지는 처음 들어갈 때 불러온다.
import { WelcomePage } from "@/pages/auth/welcome";
import { LoginPage } from "@/pages/auth/login";
import { HomePage } from "@/pages/home";
import { NotFoundPage } from "@/pages/not-found";
import { PageLoading, PullToRefresh } from "@/shared";

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
  const queryClient = useQueryClient();
  const location = useLocation();
  const { mutateAsync: generateRecommendation } = useMutation({
    mutationFn: generateRecommendationApi,
    retry: false,
  });

  const handleRefresh = async (): Promise<void> => {
    const accessToken = location.pathname.startsWith("/s/") ? null : await getAccessToken();
    const latestRecommendation = { queryKey: recommendationQueryKeys.latest(), exact: true };
    const recommendationQuery = queryClient.getQueryCache().find(latestRecommendation);

    if (accessToken) {
      // 이전 추천 조회가 새로 생성한 결과를 덮어쓰지 않도록 먼저 취소한다.
      await queryClient.cancelQueries(latestRecommendation);
    }

    const results = await Promise.allSettled([
      queryClient.refetchQueries(
        {
          type: "active",
          predicate: query => !accessToken || !matchQuery(latestRecommendation, query),
        },
        { cancelRefetch: false, throwOnError: true }
      ),
      accessToken
        ? generateRecommendation({ force_refresh: true }).then(recommendation => {
            // 로그인·로그아웃으로 캐시가 초기화되면 이전 계정의 결과를 넣지 않는다.
            // 자동 토큰 갱신만으로는 현재 화면의 추천 반영을 막지 않는다.
            if (
              recommendationQuery &&
              queryClient.getQueryCache().find(latestRecommendation) === recommendationQuery
            ) {
              queryClient.setQueryData(recommendationQueryKeys.latest(), recommendation);
            }
          })
        : Promise.resolve(),
    ]);
    const failed = results.find(result => result.status === "rejected");
    if (failed?.status === "rejected") {
      throw failed.reason;
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} resetKey={location.key}>
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
    </PullToRefresh>
  );
};

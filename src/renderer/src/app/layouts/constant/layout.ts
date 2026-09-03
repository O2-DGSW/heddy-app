export const BOTTOM_BAR_HIDDEN_PATHS = [
  "/login",
  "/signup",
  "/welcome",
  "/find-id",
  "/find-password",
];
export const BOTTOM_BAR_HIDDEN_PREFIXES = ["/find/"];
// 이 경로들은 cap-page 안에서 스크롤을 직접 처리하거나, 페이지 특성상 부모 main의
// 스크롤을 잠근다. cap-page 기반 전환 애니메이션은 main 스크롤과 섞이지 않는 쪽이 안정적이다.
export const PAGE_SCROLL_PATHS = [
  "/home",
  "/profile",
  "/recommend",
  "/welcome",
  "/login",
  "/signup",
  "/find-id",
  "/find-password",
];
export const PAGE_SCROLL_PREFIXES = ["/cuts"];

export const BOTTOM_BAR_HIDDEN_PATHS = [
  "/login",
  "/signup",
  "/welcome",
  "/find-id",
  "/find-password",
];
export const BOTTOM_BAR_HIDDEN_PREFIXES = ["/find/"];
// "/cuts"로 시작하는 모든 경로: cap-page 기반 전환 애니메이션을 쓰면서
// 각 페이지가 자기 안에서 직접 스크롤하므로, <main>은 스크롤을 넘겨줘야 한다.
export const PAGE_SCROLL_PATHS = ["/cuts"];

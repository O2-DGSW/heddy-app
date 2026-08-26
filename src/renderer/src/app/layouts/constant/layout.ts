export const BOTTOM_BAR_HIDDEN_PATHS = [
  "/login",
  "/signup",
  "/welcome",
  "/find-id",
  "/find-password",
];
export const BOTTOM_BAR_HIDDEN_PREFIXES = ["/find/"];
// 이 경로들은 페이지가 자기 안에서 직접 스크롤한다 (헤더를 스크롤 밖 별도
// 영역으로 분리해 고정하기 위함 등) — <main>은 자기 스크롤을 넘겨줘야 한다.
// "/cuts"는 cap-page 기반 전환 애니메이션이 페이지 자체 스크롤을 전제로 하기 때문.
export const PAGE_SCROLL_PATHS = ["/cuts", "/recommend"];

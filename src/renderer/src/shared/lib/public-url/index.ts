/**
 * `public/` 폴더 파일의 URL. 웹 배포는 `heddy.site/mobile` 하위 경로(Vite `base` = `/mobile/`)라서
 * `"/heddyIcon.svg"`처럼 루트 절대경로로 쓰면 랜딩 쪽으로 요청이 간다. 항상 이 함수로 base를 붙인다.
 * 네이티브(Capacitor) 빌드는 base가 `/`라서 결과가 지금과 같다.
 */
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

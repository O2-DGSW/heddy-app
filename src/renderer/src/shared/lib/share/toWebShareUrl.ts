/**
 * 웹 배포는 `heddy.site/mobile` 하위 경로에서 서비스된다. 서버가 내려주는 공유 링크가
 * `/s/<토큰>`처럼 `/mobile` 없이 오면 링크를 열었을 때 랜딩 쪽으로 가서 화면이 열리지 않는다.
 * 네이티브(Capacitor) 빌드는 base가 `/`라서 BASE_URL로는 구할 수 없어, 공유 링크용 경로를 따로 둔다.
 */
const WEB_SHARE_BASE_PATH = "/mobile";

const SHARE_PATH_PATTERN = /\/s\/([^/?#]+)\/?$/;

/** 서버가 준 공유 링크를 `<서버가 준 주소>/mobile/s/<토큰>` 형태로 맞춘다. 이미 맞으면 그대로다. */
export const toWebShareUrl = (shareUrl: string): string => {
  let url: URL;

  try {
    url = new URL(shareUrl);
  } catch {
    return shareUrl;
  }

  const tokenMatch = SHARE_PATH_PATTERN.exec(url.pathname);

  if (!tokenMatch) {
    return shareUrl;
  }

  url.pathname = `${WEB_SHARE_BASE_PATH}/s/${tokenMatch[1]}`;

  return url.toString();
};

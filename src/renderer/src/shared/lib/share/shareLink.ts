import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

interface ShareLinkParams {
  /** 공유 시트 제목. 안드로이드 선택창 상단에 쓰인다 */
  title: string;
  /** 카톡·문자 등에 함께 실리는 문구 */
  text: string;
  url: string;
}

/**
 * 네이티브 공유 시트를 연다(카톡·문자·메모·에어드랍 등).
 * - 앱에서는 Capacitor 플러그인이, 웹에서는 브라우저의 navigator.share가 처리한다.
 * - 둘 다 없으면(데스크톱 브라우저 등) false를 돌려주니, 부르는 쪽에서 링크 복사로 대신하면 된다.
 * - 사용자가 시트를 그냥 닫아도 오류로 올라오므로, 실패와 취소를 구분하지 않고 조용히 넘긴다.
 */
export const shareLink = async ({ title, text, url }: ShareLinkParams): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({ title, text, url, dialogTitle: title });

      return true;
    } catch {
      return false;
    }
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });

      return true;
    } catch {
      return false;
    }
  }

  return false;
};

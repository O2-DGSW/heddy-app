import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

interface CameraPermissionNoticeProps {
  onAgree: () => void;
}

/**
 * 카메라를 켜기 전에 사용 목적을 먼저 알린다. 사용자가 계속하기를 눌러야 시스템 권한 창이 뜬다.
 * 허용하지 않아도 하단 탭으로 다른 기능을 그대로 쓸 수 있다.
 */
const CameraPermissionNotice = ({ onAgree }: CameraPermissionNoticeProps) => (
  <section
    aria-labelledby="camera-permission-notice-title"
    className="absolute inset-0 flex flex-col items-center justify-center gap-[14px] px-[28px] text-center"
    style={{ backgroundColor: lightTheme.background.normal }}
  >
    <h2
      className={font.headline1.bold}
      id="camera-permission-notice-title"
      style={{ color: lightTheme.label.neutral }}
    >
      카메라 사용 안내
    </h2>
    <p className={font.body.regular} style={{ color: lightTheme.label.alternative }}>
      AR 헤어스타일 체험을 위해 카메라를 사용해요.
      <br />
      카메라 영상을 AR 서버로 보내 헤어스타일을 합성해 보여 드려요.
    </p>
    <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
      선택 권한이라 허용하지 않아도 다른 기능은 이용할 수 있어요.
      <br />
      권한은 휴대폰 설정에서 언제든 바꿀 수 있어요.
    </p>
    <button
      className={cn(
        "mt-[6px] h-[48px] w-full max-w-[300px] rounded-[12px]",
        font.headline2.semiBold
      )}
      onClick={onAgree}
      style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
      type="button"
    >
      허용하고 계속
    </button>
  </section>
);

export default CameraPermissionNotice;

import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import { OPTIONAL_PERMISSIONS, REQUIRED_PERMISSIONS } from "../../model/permissionNotice.constants";
import { useAppPermissionNotice } from "../../model/usePermissionNotice";

import type { PermissionNoticeItem } from "../../model/permissionNotice.constants";

interface PermissionGroupProps {
  title: string;
  items: PermissionNoticeItem[];
}

const PermissionGroup = ({ title, items }: PermissionGroupProps) => (
  <section className="flex flex-col gap-[10px]">
    <h3 className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
      {title}
    </h3>
    {items.length === 0 ? (
      <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
        없음
      </p>
    ) : (
      <ul className="flex flex-col gap-[8px]">
        {items.map(item => (
          <li
            className="flex flex-col gap-[4px] rounded-[12px] px-[14px] py-[12px]"
            key={item.name}
            style={{ backgroundColor: lightTheme.background.neutral }}
          >
            <span className={font.body.semiBold} style={{ color: lightTheme.label.neutral }}>
              {item.name}
            </span>
            <span className={font.label.regular} style={{ color: lightTheme.label.alternative }}>
              {item.purpose}
            </span>
          </li>
        ))}
      </ul>
    )}
  </section>
);

/** 앱을 처음 실행했을 때 한 번 보여 주는 접근권한 안내. 확인하면 다시 띄우지 않는다 */
const AppPermissionNotice = () => {
  const { isOpen, handleConfirm } = useAppPermissionNotice();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="app-permission-notice-title"
      aria-modal="true"
      className="fixed inset-y-0 left-1/2 z-[60] flex w-full max-w-[430px] -translate-x-1/2 flex-col px-[24px] pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))]"
      role="dialog"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-[24px] overflow-y-auto">
        <div className="flex flex-col gap-[8px]">
          <h2
            className={font.title2.bold}
            id="app-permission-notice-title"
            style={{ color: lightTheme.label.neutral }}
          >
            앱 접근 권한 안내
          </h2>
          <p className={font.body.regular} style={{ color: lightTheme.label.alternative }}>
            헤디는 서비스 제공을 위해 아래 권한을 사용해요.
          </p>
        </div>

        <PermissionGroup items={REQUIRED_PERMISSIONS} title="필수 접근 권한" />
        <PermissionGroup items={OPTIONAL_PERMISSIONS} title="선택 접근 권한" />

        <ul
          className={cn("flex list-disc flex-col gap-[6px] pl-[18px]", font.caption.regular)}
          style={{ color: lightTheme.label.assistive }}
        >
          <li>선택 접근 권한은 허용하지 않아도 해당 기능 외의 서비스는 이용할 수 있어요.</li>
          <li>카메라 권한은 AR 헤어스타일 체험을 처음 시작할 때 다시 여쭤봐요.</li>
          <li>
            권한은 휴대폰 설정 &gt; 애플리케이션 &gt; 헤디 &gt; 권한에서 언제든 바꿀 수 있어요.
          </li>
        </ul>
      </div>

      <button
        className={cn("mt-[16px] h-[52px] w-full shrink-0 rounded-[14px]", font.headline2.semiBold)}
        onClick={handleConfirm}
        style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
        type="button"
      >
        확인
      </button>
    </div>
  );
};

export default AppPermissionNotice;

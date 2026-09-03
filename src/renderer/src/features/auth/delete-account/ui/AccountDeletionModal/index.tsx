import { font, lightTheme } from "@heddy/design-tokens";

import { useDeleteAccount } from "../../model/useDeleteAccount";

interface AccountDeletionModalProps {
  onClose: () => void;
}

const AccountDeletionModal = ({ onClose }: AccountDeletionModalProps) => {
  const { handleDeleteAccount, isPending, password, setPassword } = useDeleteAccount({ onClose });

  return (
    <div
      aria-labelledby="account-deletion-modal-title"
      aria-modal="true"
      className="fixed inset-y-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-center bg-black/50 px-[24px]"
      role="dialog"
    >
      <form
        aria-busy={isPending}
        className="w-full rounded-[15px] px-[20px] pb-[20px] pt-[22px]"
        onSubmit={event => {
          event.preventDefault();
          void handleDeleteAccount();
        }}
        style={{ backgroundColor: lightTheme.background.normal }}
      >
        <h2
          className={font.headline1.bold}
          id="account-deletion-modal-title"
          style={{ color: lightTheme.label.neutral }}
        >
          회원 탈퇴
        </h2>
        <p
          className={`mt-[10px] ${font.label.regular}`}
          style={{ color: lightTheme.label.alternative }}
        >
          탈퇴 요청 후 계정 접근이 즉시 차단됩니다.
          <br />
          삭제된 정보는 복구할 수 없어요.
        </p>

        <label className="mt-[20px] flex flex-col gap-[8px]" htmlFor="account-deletion-password">
          <span className={font.label.medium} style={{ color: lightTheme.label.alternative }}>
            비밀번호 확인
          </span>
          <input
            autoComplete="current-password"
            className={`h-[42px] rounded-[10px] border-0 px-[15px] outline-none disabled:cursor-not-allowed disabled:opacity-60 ${font.caption.regular}`}
            disabled={isPending}
            id="account-deletion-password"
            onChange={event => setPassword(event.target.value)}
            placeholder="비밀번호를 입력하세요"
            style={{
              backgroundColor: lightTheme.background.neutral,
              color: lightTheme.label.neutral,
            }}
            type="password"
            value={password}
          />
        </label>

        <div className="mt-[24px] grid grid-cols-2 gap-[7px]">
          <button
            className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
            disabled={isPending}
            onClick={onClose}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            취소
          </button>
          <button
            className={`h-[42px] rounded-[10px] border-0 ${font.headline2.semiBold}`}
            disabled={isPending}
            style={{
              backgroundColor: lightTheme.status.error,
              color: lightTheme.label.buttonText,
            }}
            type="submit"
          >
            {isPending ? "탈퇴 요청 중" : "탈퇴하기"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountDeletionModal;

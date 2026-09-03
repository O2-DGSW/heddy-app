import { lightTheme } from "@heddy/design-tokens";

export type ToastStatusType = "error" | "success";

interface ToastMessageProps {
  message: string;
  status: ToastStatusType;
}

const ToastMessage = ({ message, status }: ToastMessageProps) => {
  return (
    <p
      className="m-0 text-[14px] font-medium leading-[1.3] tracking-[-0.02em]"
      style={{ color: status === "error" ? lightTheme.status.error : lightTheme.label.neutral }}
    >
      {message}
    </p>
  );
};

export default ToastMessage;

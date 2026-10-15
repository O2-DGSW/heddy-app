import { toast } from "react-toastify";

import ToastMessage from "./ToastMessage";
import type { ToastStatusType } from "./ToastMessage";

const showToast = (message: string, status: ToastStatusType) => {
  toast(<ToastMessage message={message} status={status} />, {
    closeOnClick: true,
    toastId: message,
  });
};

export const showErrorToast = (message: string) => {
  showToast(message, "error");
};

export const showSuccessToast = (message: string) => {
  showToast(message, "success");
};

/** 성공·실패가 아닌 안내(예: 아직 준비 중이라 누를 수 없을 때) */
export const showInfoToast = (message: string) => {
  showToast(message, "info");
};

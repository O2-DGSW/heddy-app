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

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  return (
    <ToastContainer
      autoClose={2500}
      className="!absolute !top-[calc(var(--safe-area-inset-top,env(safe-area-inset-top,0px))+20px)] !flex !w-full !justify-center !px-[20px]"
      closeButton={false}
      draggable={false}
      hideProgressBar
      limit={1}
      newestOnTop
      pauseOnFocusLoss={false}
      pauseOnHover
      position="top-center"
      toastClassName="!min-h-0 !w-fit !max-w-full !rounded-[10px] !bg-white !px-[16px] !py-[12px] !shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
    />
  );
};

export default ToastProvider;

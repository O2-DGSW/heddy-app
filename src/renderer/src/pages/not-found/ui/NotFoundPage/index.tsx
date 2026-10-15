import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { cn, sadMascot } from "@/shared";

/** 없는 주소로 들어왔을 때. 첫 화면("/")으로 보내면 로그인 상태에 맞는 화면으로 이어진다 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <main
      aria-labelledby="not-found-title"
      className="flex h-full flex-col items-center justify-center gap-[12px] px-[24px] text-center"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <img alt="" className="h-28 w-28" src={sadMascot} />
      <h1
        className={font.headline1.bold}
        id="not-found-title"
        style={{ color: lightTheme.label.neutral }}
      >
        페이지를 찾을 수 없어요
      </h1>
      <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
        주소가 바뀌었거나 삭제된 화면이에요.
      </p>
      <button
        className={cn("mt-[8px] h-[46px] rounded-[12px] px-[28px]", font.headline2.semiBold)}
        onClick={handleGoHome}
        style={{ backgroundColor: lightTheme.primary.normal, color: lightTheme.label.buttonText }}
        type="button"
      >
        처음 화면으로
      </button>
    </main>
  );
};

export default NotFoundPage;

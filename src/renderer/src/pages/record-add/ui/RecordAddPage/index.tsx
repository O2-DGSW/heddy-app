import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { arrowIcon } from "@/entities/record";
import { RecordAddForm } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

const RecordAddPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    setDirection("back");
    navigate(-1);
  };

  return (
    <cap-page>
      <section
        aria-labelledby="record-add-title"
        className="flex h-full min-h-0 flex-col overflow-hidden"
        style={pageStyle}
      >
        <header
          className="relative z-10 flex h-[58px] shrink-0 items-center justify-center"
          style={pageStyle}
        >
          <button
            aria-label="뒤로 가기"
            className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
            onClick={handleClose}
            type="button"
          >
            <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
          </button>

          <h1 className={font.headline1.bold} id="record-add-title" style={headingStyle}>
            기록 추가
          </h1>
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-contain pb-[15px] no-scrollbar [-webkit-overflow-scrolling:touch]">
          <RecordAddForm onCancel={handleClose} />
        </div>
      </section>
    </cap-page>
  );
};

export default RecordAddPage;

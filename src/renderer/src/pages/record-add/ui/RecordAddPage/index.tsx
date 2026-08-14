import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";

import { arrowIcon } from "@/entities/record";
import { RecordAddForm } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

const RecordAddPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <section
      aria-labelledby="record-add-title"
      className="min-h-full overflow-x-clip pb-[15px]"
      style={pageStyle}
    >
      <header
        className="sticky top-0 z-10 flex h-[58px] items-center justify-center"
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

      <RecordAddForm onCancel={handleClose} />
    </section>
  );
};

export default RecordAddPage;

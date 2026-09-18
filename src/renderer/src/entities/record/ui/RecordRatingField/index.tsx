import { font, lightTheme } from "@heddy/design-tokens";
import { Rating } from "react-simple-star-rating";

import type { ChangeEvent } from "react";

interface RecordRatingFieldProps {
  rating: number;
  errorMessage?: string;
  onChange: (nextRating: number) => void;
}

/** 별 하나 크기(px). 손가락으로 반 칸을 집어야 해서 넉넉하게 잡는다 */
const STAR_SIZE = 38;

/** 별점 단위. 서버에 보내는 값도 같은 단위다 */
const RATING_STEP = 0.5;
const MAX_RATING = 5;

const RecordRatingField = ({ errorMessage, rating, onChange }: RecordRatingFieldProps) => {
  const hasError = Boolean(errorMessage);
  const errorId = "record-rating-error";

  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.currentTarget.value));
  };

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        만족도
      </h2>
      <div className="flex h-[59px] items-center justify-center">
        {/* 반 칸 선택(allowFraction)과 터치 드래그는 직접 만들면 손이 많이 가서 라이브러리에 맡긴다.
            다만 라이브러리가 포커스 갈 요소를 만들지 않아 보조기기에는 숨기고, 아래 range 입력을 대신 읽힌다. */}
        <div aria-hidden="true">
          <Rating
            allowFraction
            emptyColor={lightTheme.line.neutral}
            fillColor={lightTheme.status.warning}
            initialValue={rating}
            onClick={onChange}
            size={STAR_SIZE}
            SVGstyle={{ display: "inline-block" }}
            transition
          />
        </div>

        {/* 키보드·스크린리더용 입력. 화면에는 안 보이지만 포커스가 가서 방향키로 0.5씩 바꿀 수 있다 */}
        <input
          aria-describedby={hasError ? errorId : undefined}
          aria-label="만족도"
          aria-valuetext={`${rating}점`}
          className="sr-only"
          max={MAX_RATING}
          min={0}
          onChange={handleRangeChange}
          step={RATING_STEP}
          type="range"
          value={rating}
        />
      </div>
      {errorMessage && (
        <span
          className={font.caption.regular}
          id={errorId}
          style={{ color: lightTheme.status.error }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default RecordRatingField;

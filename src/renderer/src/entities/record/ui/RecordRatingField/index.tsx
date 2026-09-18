import { font, lightTheme } from "@heddy/design-tokens";
import { Rating } from "react-simple-star-rating";

interface RecordRatingFieldProps {
  rating: number;
  errorMessage?: string;
  onChange: (nextRating: number) => void;
}

/** 별 하나 크기(px). 손가락으로 반 칸을 집어야 해서 넉넉하게 잡는다 */
const STAR_SIZE = 38;

const RecordRatingField = ({ errorMessage, rating, onChange }: RecordRatingFieldProps) => {
  const hasError = Boolean(errorMessage);
  const errorId = "record-rating-error";

  return (
    <div className="flex w-full flex-col gap-[10px]">
      <h2 className={font.headline2.semiBold} style={{ color: lightTheme.label.neutral }}>
        만족도
      </h2>
      <div
        aria-describedby={hasError ? errorId : undefined}
        aria-label={`만족도 ${rating}점`}
        className="flex h-[59px] items-center justify-center"
      >
        {/* 반 칸 선택(allowFraction)과 터치 드래그는 직접 만들면 손이 많이 가서 라이브러리에 맡긴다.
            별 모양·색만 디자인 토큰으로 맞춘다. */}
        <Rating
          allowFraction
          fillColor={lightTheme.status.warning}
          emptyColor={lightTheme.line.neutral}
          initialValue={rating}
          onClick={onChange}
          size={STAR_SIZE}
          SVGstyle={{ display: "inline-block" }}
          transition
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

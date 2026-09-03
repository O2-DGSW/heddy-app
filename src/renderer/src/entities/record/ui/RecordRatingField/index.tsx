import { font, lightTheme } from "@heddy/design-tokens";

import { cn } from "@/shared";

import { starDisabledIcon, starIcon } from "../../assets";

interface RecordRatingFieldProps {
  rating: number;
  errorMessage?: string;
  onChange: (nextRating: number) => void;
}

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

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
        role="radiogroup"
      >
        {RATING_VALUES.map(ratingValue => (
          <button
            aria-checked={rating === ratingValue}
            aria-label={`${ratingValue}점`}
            className={cn(
              "flex h-[35px] w-[35px] items-center justify-center border-0 bg-transparent p-0",
              ratingValue < 5 && "-mr-[3px]"
            )}
            key={ratingValue}
            onClick={() => onChange(ratingValue)}
            role="radio"
            type="button"
          >
            <img
              alt=""
              className={cn(ratingValue <= rating ? "h-[35px] w-[35px]" : "h-[24px] w-[25px]")}
              src={ratingValue <= rating ? starIcon : starDisabledIcon}
            />
          </button>
        ))}
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

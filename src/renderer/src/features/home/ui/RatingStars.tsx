import starIcon from "@/pages/home/assets/star.svg";

import type { RatingStarsProps } from "@/pages/home/model/types.ts";

const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <span aria-label={`평점 ${rating}점`} className="mt-px flex -space-x-[3px]">
      {Array.from({ length: 5 }, (_, index) => (
        <img
          key={index}
          src={starIcon}
          alt=""
          className={`size-[15px] ${index < rating ? "" : "opacity-25 grayscale"}`}
        />
      ))}
    </span>
  );
};

export default RatingStars;

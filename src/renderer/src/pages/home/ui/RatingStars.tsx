import starIcon from "../assets/star.svg";

import type { RatingStarsProps } from "../model/types";

const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <span aria-label={`평점 ${rating}점`} className="mt-px flex -space-x-[3px]">
      {Array.from({ length: 5 }, (_, index) => (
        <img key={index} src={starIcon} alt="" className="size-[15px]" />
      ))}
    </span>
  );
};

export default RatingStars;

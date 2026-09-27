import { cn } from "@/shared";
import starIcon from "../../assets/star.svg";
interface RatingStarsProps {
  rating: number;
}
const RatingStars = ({ rating }: RatingStarsProps) => (
  <span role="img" aria-label={`5점 만점에 ${rating}점`} className="flex -space-x-[2px]">
    {Array.from({ length: 5 }, (_, index) => (
      <img
        key={index}
        src={starIcon}
        alt=""
        className={cn(index >= rating && "opacity-25 grayscale")}
      />
    ))}
  </span>
);
export default RatingStars;

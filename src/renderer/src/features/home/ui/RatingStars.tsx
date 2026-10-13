import { cn, StarIcon } from "@/shared";
interface RatingStarsProps {
  rating: number;
}
const RatingStars = ({ rating }: RatingStarsProps) => {
  const safeRating = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
  return (
    <span role="img" aria-label={`5점 만점에 ${safeRating}점`} className="flex -space-x-[2px]">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "h-[14.3431px] w-[14.3431px]",
            index >= safeRating && "opacity-25 grayscale"
          )}
        />
      ))}
    </span>
  );
};
export default RatingStars;

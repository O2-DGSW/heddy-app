import { useState } from "react";
import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";

interface HomeImageProps {
  src?: string;
  alt: string;
  className?: string;
}
const HomeImage = ({ src, alt, className }: HomeImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string>();
  const hasImage = Boolean(src?.trim()) && src !== failedSrc;
  const handleError = () => setFailedSrc(src);
  if (!hasImage)
    return (
      <span
        role="img"
        aria-label={`${alt || "스타일"}: 사진 없음`}
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-[var(--home-background)] p-1 text-center text-[var(--home-muted)]",
          font.caption.medium
        )}
      >
        사진 없음
      </span>
    );
  return <img src={src} alt={alt} className={className} draggable={false} onError={handleError} />;
};
export default HomeImage;

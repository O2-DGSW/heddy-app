import { useState } from "react";
import type { SyntheticEvent } from "react";
import { font } from "@heddy/design-tokens";
import { cn } from "@/shared";

interface HomeImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}
type ImageStatusType = "loading" | "ready" | "error";

const HomeImageContent = ({ src, alt, className, loading = "lazy" }: HomeImageProps) => {
  const [status, setStatus] = useState<ImageStatusType>("loading");
  const hasImage = Boolean(src?.trim()) && status !== "error";

  const handleError = () => setStatus("error");
  const handleLoad = async (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    try {
      if (typeof image.decode === "function") await image.decode();
      if (image.isConnected) setStatus("ready");
    } catch {
      if (image.isConnected) setStatus("error");
    }
  };

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
  return (
    <>
      {status === "loading" && (
        <span aria-hidden="true" className="absolute inset-0 bg-[var(--home-background)]" />
      )}
      <img
        decoding="async"
        loading={loading}
        src={src}
        alt={alt}
        className={cn(
          className,
          "transition-opacity duration-200 motion-reduce:transition-none",
          status === "ready" ? "opacity-100" : "opacity-0"
        )}
        draggable={false}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
};

// URL이 바뀌면 준비 상태도 초기화해 이전 사진의 로딩 완료가 새 사진에 적용되지 않게 한다.
const HomeImage = (props: HomeImageProps) => <HomeImageContent key={props.src} {...props} />;

export default HomeImage;

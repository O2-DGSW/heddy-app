import type { ReactNode, Ref } from "react";
import { lightTheme } from "@heddy/design-tokens";
import { cn } from "@/shared";

interface ArCameraViewportProps {
  videoRef: Ref<HTMLVideoElement>;
  children?: ReactNode;
  mirrored?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}

const ArCameraViewport = ({
  videoRef,
  children,
  mirrored = false,
  fit = "cover",
  className = "h-full",
}: ArCameraViewportProps) => (
  <div
    className={cn("relative w-full overflow-hidden", className)}
    style={{ backgroundColor: lightTheme.label.normal }}
  >
    <video
      aria-label="카메라 미리보기"
      autoPlay
      className={cn(
        "absolute inset-0 h-full w-full",
        fit === "contain" && "object-contain",
        fit === "cover" && "object-cover",
        mirrored && "-scale-x-100"
      )}
      muted
      playsInline
      ref={videoRef}
    />
    {children}
  </div>
);

export default ArCameraViewport;

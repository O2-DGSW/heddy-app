import recentHairImage from "@/pages/home/assets/recent-hair.png";

import type { CroppedHairImageProps } from "@/pages/home/model/types.ts";

const CroppedHairImage = ({ alt, src = recentHairImage }: CroppedHairImageProps) => {
  return (
    <span className="relative block size-full overflow-hidden rounded-[12px]">
      <img
        src={src}
        alt={alt}
        className="absolute left-[0.3%] top-[-22%] h-[166%] w-full max-w-none object-cover"
      />
    </span>
  );
};

export default CroppedHairImage;

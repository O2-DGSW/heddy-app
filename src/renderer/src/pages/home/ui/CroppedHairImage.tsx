import recentHairImage from "../assets/recent-hair.png";

import type { CroppedHairImageProps } from "../model/types";

const CroppedHairImage = ({ alt }: CroppedHairImageProps) => {
  return (
    <span className="relative block size-full overflow-hidden rounded-[12px]">
      <img
        src={recentHairImage}
        alt={alt}
        className="absolute left-[0.3%] top-[-22%] h-[166%] w-full max-w-none object-cover"
      />
    </span>
  );
};

export default CroppedHairImage;

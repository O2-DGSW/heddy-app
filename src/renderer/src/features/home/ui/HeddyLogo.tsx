import { HEDDY_LOGO_PARTS } from "@/pages/home/model/constants.ts";

const HeddyLogo = () => {
  return (
    <span aria-label="heddy" role="img" className="relative block h-[28px] w-[83.12px] shrink-0">
      {HEDDY_LOGO_PARTS.map(({ src, className }) => (
        <img key={src} src={src} alt="" className={`absolute ${className}`} />
      ))}
    </span>
  );
};

export default HeddyLogo;

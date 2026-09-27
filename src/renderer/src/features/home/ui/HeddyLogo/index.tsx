import h from "../../assets/logo-h.svg";
import e from "../../assets/logo-e.svg";
import d1 from "../../assets/logo-d1.svg";
import d2 from "../../assets/logo-d2.svg";
import y from "../../assets/logo-y.svg";

const HeddyLogo = () => (
  <span aria-label="heddy" role="img" className="relative block h-7 w-[84px] shrink-0">
    <img src={h} alt="" className="absolute left-0 top-[0.13px]" />
    <img src={e} alt="" className="absolute left-[16.35px] top-[5.79px]" />
    <img src={d1} alt="" className="absolute left-[33.48px] top-0" />
    <img src={d2} alt="" className="absolute left-[50.47px] top-0" />
    <img src={y} alt="" className="absolute left-[67.72px] top-[6.53px]" />
  </span>
);
export default HeddyLogo;

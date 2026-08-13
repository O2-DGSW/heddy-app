import { font, lightTheme } from "@heddy/design-tokens";
import { Link } from "react-router-dom";
import type { MemberType } from "@/features/auth/signup/model/types";
import AgerUserIcon from "@/features/auth/signup/assets/signup-type/agerUser.svg";
import AgerDesignerIcon from "@/features/auth/signup/assets/signup-type/agerDesigner.svg";

interface SignupTypeSelectProps {
  onSelect: (type: MemberType) => void;
}

export const SignupTypeSelect = ({ onSelect }: SignupTypeSelectProps) => {
  const handleCustomerSelect = () => onSelect("customer");
  const handleOwnerSelect = () => onSelect("owner");

  return (
    <div className="flex flex-col w-full">
      <button className="flex items-center gap-6 w-full py-8 pl-6" onClick={handleCustomerSelect}>
        <img src={AgerUserIcon} alt="고객/디자이너 회원" className="w-28 h-28 object-contain" />
        <div className="flex flex-col items-start gap-2">
          <p
            className={`${font.headline1.bold} text-left`}
            style={{ color: lightTheme.label.neutral }}
          >
            미용실을 관리할
            <br />
            플랫폼을 찾으세요?
          </p>
          <p className={font.body.medium} style={{ color: lightTheme.primary.normal }}>
            고객/디자이너 회원&gt;
          </p>
        </div>
      </button>

      <div className="w-full h-px" style={{ backgroundColor: lightTheme.line.alternative }} />

      <button className="flex items-center gap-6 w-full py-8 pl-6" onClick={handleOwnerSelect}>
        <img src={AgerDesignerIcon} alt="원장 회원" className="w-28 h-28 object-contain" />
        <div className="flex flex-col items-start gap-2">
          <p
            className={`${font.headline1.bold} text-left`}
            style={{ color: lightTheme.label.normal }}
          >
            미용실을 관리할
            <br />
            플랫폼을 찾으세요?
          </p>
          <p className={font.body.medium} style={{ color: lightTheme.primary.normal }}>
            원장 회원&gt;
          </p>
        </div>
      </button>

      <div
        className={`flex justify-center gap-2 mt-4 ${font.body.medium}`}
        style={{ color: lightTheme.label.assistive }}
      >
        <span>이미 계정이 있으신가요?</span>
        <Link to="/login" style={{ color: lightTheme.primary.normal }}>
          로그인
        </Link>
      </div>
    </div>
  );
};

import { useNavigate } from "react-router-dom";
import { font, lightTheme } from "@heddy/design-tokens";

type FindTabPathType = "/find-id" | "/find-password";

const FIND_TABS: { label: string; path: FindTabPathType }[] = [
  { label: "아이디 찾기", path: "/find-id" },
  { label: "비밀번호 찾기", path: "/find-password" },
];

interface FindTabsProps {
  activePath: FindTabPathType;
}

/** 아이디 찾기·비밀번호 찾기 화면이 함께 쓰는 상단 탭 */
export const FindTabs = ({ activePath }: FindTabsProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex w-full mb-8"
      style={{ borderBottom: `1px solid ${lightTheme.line.alternative}` }}
    >
      {FIND_TABS.map(({ label, path }) => {
        const isActive = path === activePath;

        return (
          <button
            key={path}
            className={`flex-1 pt-3 flex flex-col items-center ${font.body.bold}`}
            style={{ color: isActive ? lightTheme.label.normal : lightTheme.label.assistive }}
            onClick={() => !isActive && navigate(path, { replace: true })}
            type="button"
          >
            <span className="pb-3">{label}</span>
            <div
              className="w-[60px] h-[2px] -mb-px"
              style={{ backgroundColor: isActive ? lightTheme.label.normal : "transparent" }}
            />
          </button>
        );
      })}
    </div>
  );
};

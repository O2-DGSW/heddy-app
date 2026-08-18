import { font, lightTheme, palette } from "@heddy/design-tokens";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { arrowIcon } from "@/entities/record";
import { cn } from "@/shared";

interface SharePermissionItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface SharePermissionSection {
  id: string;
  title: string;
  items: SharePermissionItem[];
}

interface PermissionToggleProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

interface PermissionRowProps {
  item: SharePermissionItem;
  onToggle: (itemId: string) => void;
}

interface PermissionSectionProps {
  section: SharePermissionSection;
  onToggle: (itemId: string) => void;
}

const INITIAL_SECTIONS: SharePermissionSection[] = [
  {
    id: "agreement",
    title: "동의 항목",
    items: [
      {
        id: "ai-training",
        title: "AI 학습 활용 동의",
        description: "내 사진 및 시술 기록을 모델 학습에 활용",
        enabled: true,
      },
      {
        id: "service-analysis",
        title: "서비스 분석 동의",
        description: "서비스 개선을 위한 통계 분석에 활용",
        enabled: true,
      },
      {
        id: "notification",
        title: "알림 수신 동의",
        description: "분석 완료 및 공유 만료 알림 수신",
        enabled: true,
      },
    ],
  },
  {
    id: "default",
    title: "기록 공유 기본 설정",
    items: [
      {
        id: "auto-share",
        title: "새 기록 자동 공유",
        description: "끄면 매번 공유할 기록을 직접 선택합니다",
        enabled: true,
      },
    ],
  },
  {
    id: "record-status",
    title: "기록별 공유 상태",
    items: [
      {
        id: "record-color-2026-07-18",
        title: "2026-07-18 염색",
        description: "준어헤어 강남점 · 만료 5일 남음",
        enabled: true,
      },
      {
        id: "record-perm-2026-05-02",
        title: "2026-05-02 펌",
        description: "공유 중 아님",
        enabled: true,
      },
    ],
  },
];

const PermissionToggle = ({ checked, label, onToggle }: PermissionToggleProps) => {
  return (
    <button
      aria-label={`${label} ${checked ? "끄기" : "켜기"}`}
      aria-pressed={checked}
      className="relative h-[27px] w-[45px] shrink-0 rounded-[14px] border-0 p-0 transition-colors duration-200"
      onClick={onToggle}
      style={{
        backgroundColor: checked ? lightTheme.primary.normal : lightTheme.line.neutral,
      }}
      type="button"
    >
      <span
        className={cn(
          "absolute top-1/2 h-[21px] w-[21px] -translate-y-1/2 rounded-full transition-[left] duration-200",
          checked ? "left-[21px]" : "left-[3px]"
        )}
        style={{ backgroundColor: palette.neutral[95] }}
      />
    </button>
  );
};

const PermissionRow = ({ item, onToggle }: PermissionRowProps) => {
  const handleToggle = () => {
    onToggle(item.id);
  };

  return (
    <div className="flex w-full items-center justify-between gap-[16px]">
      <div className="min-w-0 flex-1">
        <p className={font.body.medium} style={{ color: lightTheme.label.alternative }}>
          {item.title}
        </p>
        <p className={font.label.regular} style={{ color: lightTheme.label.assistive }}>
          {item.description}
        </p>
      </div>

      <PermissionToggle checked={item.enabled} label={item.title} onToggle={handleToggle} />
    </div>
  );
};

const PermissionSection = ({ section, onToggle }: PermissionSectionProps) => {
  return (
    <section
      aria-labelledby={`${section.id}-title`}
      className="flex flex-col gap-[36px] px-[25px] py-[46px]"
    >
      <h2
        className={font.headline1.semiBold}
        id={`${section.id}-title`}
        style={{ color: lightTheme.label.neutral }}
      >
        {section.title}
      </h2>

      <div className="flex flex-col gap-[36px]">
        {section.items.map(item => (
          <PermissionRow item={item} key={item.id} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
};

const SharePermissionsPage = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<SharePermissionSection[]>(INITIAL_SECTIONS);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggle = (itemId: string) => {
    setSections(currentSections =>
      currentSections.map(section => ({
        ...section,
        items: section.items.map(item =>
          item.id === itemId ? { ...item, enabled: !item.enabled } : item
        ),
      }))
    );
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    navigate(-1);
  };

  return (
    <section
      aria-labelledby="share-permissions-title"
      className="flex min-h-full flex-col overflow-x-clip"
      style={{ backgroundColor: lightTheme.background.normal }}
    >
      <header className="relative flex h-[54px] shrink-0 items-center justify-center px-[20px]">
        <button
          aria-label="뒤로 가기"
          className="absolute left-[20px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          onClick={handleBack}
          type="button"
        >
          <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
        </button>

        <h1
          className={font.headline1.bold}
          id="share-permissions-title"
          style={{ color: lightTheme.label.neutral }}
        >
          공유 권한 관리
        </h1>
      </header>

      <div className="flex flex-1 flex-col" style={{ backgroundColor: lightTheme.fill.normal }}>
        <div className="flex-1">
          {sections.map((section, index) => (
            <div
              className={cn(index < sections.length - 1 && "border-b")}
              key={section.id}
              style={{ borderColor: lightTheme.line.alternative }}
            >
              <PermissionSection section={section} onToggle={handleToggle} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-[7px] px-[18px] pb-[28px]">
          <button
            className={`h-[42px] rounded-[10px] border ${font.headline2.semiBold}`}
            onClick={handleClose}
            style={{
              backgroundColor: lightTheme.background.alternative,
              borderColor: lightTheme.fill.neutral,
              color: lightTheme.label.alternative,
            }}
            type="button"
          >
            닫기
          </button>
          <button
            className={`h-[42px] rounded-[10px] border border-transparent ${font.headline2.semiBold}`}
            onClick={handleSave}
            style={{
              backgroundColor: lightTheme.primary.normal,
              color: lightTheme.label.buttonText,
            }}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </section>
  );
};

export default SharePermissionsPage;

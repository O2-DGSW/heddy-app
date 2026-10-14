import { font, lightTheme } from "@heddy/design-tokens";

import type { PublicShareSavedStyle } from "@/entities/share";

import SectionTitle from "../SectionTitle";

interface SavedStyleSectionProps {
  savedStyles: PublicShareSavedStyle[];
}

const SavedStyleSection = ({ savedStyles }: SavedStyleSectionProps) => (
  // 시술기록 쪽(SharedRecordSections)과 같은 pt-[29px]를 둬서 헤더와 붙어 보이지 않게 한다.
  <section
    className="flex flex-col gap-[10px] px-[19px] pb-[30px] pt-[29px]"
    aria-label="후보 스타일"
  >
    <SectionTitle>후보 스타일</SectionTitle>
    <div className="flex flex-col gap-[10px]">
      {savedStyles.map((style, index) => (
        <div
          className="flex items-center gap-[12px] rounded-[15px] p-[12px]"
          key={index}
          style={{ backgroundColor: lightTheme.background.normal }}
        >
          {style.image_url && (
            <img
              decoding="async"
              loading="lazy"
              width={70}
              height={70}
              alt=""
              className="h-[70px] w-[70px] shrink-0 rounded-[10px] object-cover"
              src={style.image_url}
            />
          )}
          <div className="flex min-w-0 flex-col gap-[4px]">
            <span className={font.body.medium} style={{ color: lightTheme.label.neutral }}>
              {style.style_name}
            </span>
            {style.reason && (
              <span className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
                {style.reason}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default SavedStyleSection;

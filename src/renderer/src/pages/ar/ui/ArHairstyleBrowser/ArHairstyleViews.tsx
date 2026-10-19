import { font, lightTheme } from "@heddy/design-tokens";

import type { ArHairstyleOption } from "@/entities/ar-groom";
import { cn } from "@/shared";

const VIEW_ANGLES = ["정면", "3/4", "옆", "뒤"] as const;

interface ArHairstyleViewsProps {
  activeHairstyle?: ArHairstyleOption;
}

const ArHairstyleViews = ({ activeHairstyle }: ArHairstyleViewsProps) => (
  <>
    {activeHairstyle?.viewsUrl ? (
      <section aria-label={`${activeHairstyle.label} 4방향 미리보기`} className="mt-5">
        <h3 className={font.label.semiBold} style={{ color: lightTheme.label.neutral }}>
          {activeHairstyle.label} · 방향별 미리보기
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {VIEW_ANGLES.map((angle, index) => (
            <div className="min-w-0" key={angle}>
              <div
                aria-label={`${activeHairstyle.label} ${angle} 미리보기`}
                className="aspect-square w-full rounded-[10px] bg-center bg-no-repeat"
                role="img"
                style={{
                  backgroundColor: lightTheme.background.neutral,
                  backgroundImage: `url("${activeHairstyle.viewsUrl}")`,
                  backgroundPosition: `${(index / (VIEW_ANGLES.length - 1)) * 100}% center`,
                  backgroundSize: "400% 100%",
                }}
              />
              <p
                className={cn("mt-1 truncate text-center", font.caption.medium)}
                style={{ color: lightTheme.label.alternative }}
              >
                {angle}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : (
      <p
        className={cn("mt-5 rounded-[10px] px-3 py-2", font.caption.regular)}
        role="status"
        style={{
          backgroundColor: lightTheme.background.alternative,
          color: lightTheme.label.alternative,
        }}
      >
        스타일을 선택하면 4방향 참고 이미지를 볼 수 있어요.
      </p>
    )}
  </>
);

export default ArHairstyleViews;

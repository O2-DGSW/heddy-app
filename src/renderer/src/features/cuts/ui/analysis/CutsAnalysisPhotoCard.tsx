import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";

import { CutsAnalysisOverlayToggle } from "@/features/cuts/ui/analysis/CutsAnalysisOverlayToggle";
import type { CutsAnalysisOverlay } from "@/features/cuts/model/types/CutsAnalysis.types";

interface CutsAnalysisPhotoCardProps {
  photoUrl: string;
  overlays: CutsAnalysisOverlay[];
}

export const CutsAnalysisPhotoCard = ({ photoUrl, overlays }: CutsAnalysisPhotoCardProps) => {
  const [activeOverlayIds, setActiveOverlayIds] = useState<string[]>(
    overlays.filter(overlay => overlay.defaultActive && overlay.imageUrl).map(overlay => overlay.id)
  );

  // 그릴 이미지가 하나도 없으면 토글을 켜도 사진에 변화가 없어, 그 사실을 화면에 알린다.
  const hasOverlayImage = overlays.some(overlay => Boolean(overlay.imageUrl));

  const handleToggle = (overlayId: string) => {
    setActiveOverlayIds(current =>
      current.includes(overlayId) ? current.filter(id => id !== overlayId) : [...current, overlayId]
    );
  };

  return (
    <section className="flex flex-col gap-3 px-4 pt-4">
      <h2 className={font.headline2.bold} style={{ color: lightTheme.label.neutral }}>
        사진에서 확인할 것
      </h2>

      <div
        className="relative mx-auto aspect-square w-4/5 overflow-hidden rounded-4xl"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="시술 분석 사진" className="h-full w-full object-cover" />
        ) : (
          <p
            className={`flex h-full w-full items-center justify-center ${font.caption.regular}`}
            style={{ color: lightTheme.label.assistive }}
          >
            등록된 사진이 없어요
          </p>
        )}

        {/* 오버레이는 사진과 같은 영역을 같은 방식(object-cover)으로 덮어야 위치가 어긋나지 않는다. */}
        {overlays.map(overlay =>
          overlay.imageUrl && activeOverlayIds.includes(overlay.id) ? (
            <img
              key={overlay.id}
              src={overlay.imageUrl}
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          ) : null
        )}
      </div>

      {overlays.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {overlays.map(overlay => (
              <CutsAnalysisOverlayToggle
                key={overlay.id}
                label={overlay.label}
                isActive={activeOverlayIds.includes(overlay.id)}
                isDisabled={!overlay.imageUrl}
                onToggle={() => handleToggle(overlay.id)}
              />
            ))}
          </div>

          {!hasOverlayImage && (
            <p className={font.caption.regular} style={{ color: lightTheme.label.assistive }}>
              오버레이 이미지는 아직 서버에서 내려오지 않아요
            </p>
          )}
        </div>
      )}
    </section>
  );
};

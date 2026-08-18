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
    overlays.filter(overlay => overlay.defaultActive).map(overlay => overlay.id)
  );

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
        className="aspect-square w-full overflow-hidden rounded-2xl"
        style={{ backgroundColor: lightTheme.fill.normal }}
      >
        {photoUrl && <img src={photoUrl} alt="시술 분석 사진" className="h-full w-full object-cover" />}
      </div>

      <div className="flex gap-2">
        {overlays.map(overlay => (
          <CutsAnalysisOverlayToggle
            key={overlay.id}
            label={overlay.label}
            isActive={activeOverlayIds.includes(overlay.id)}
            onToggle={() => handleToggle(overlay.id)}
          />
        ))}
      </div>
    </section>
  );
};

import type { ArGroomFitSettings } from "./types";

export const DEFAULT_GROOM_FIT_SETTINGS: ArGroomFitSettings = {
  groom_color: "",
  dyn: 1,
  scale: 1,
  offset: 0,
  groom_fwd: 0,
};

export const GROOM_FIT_RANGES = {
  dyn: { label: "머리 흔들림", min: 0, max: 2, step: 0.1, unit: "" },
  scale: { label: "크기", min: 0.5, max: 2, step: 0.05, unit: "배" },
  offset: { label: "상하 위치", min: -150, max: 150, step: 1, unit: "" },
  groom_fwd: { label: "앞뒤 위치", min: -15, max: 15, step: 0.5, unit: "cm" },
} as const;

export const isValidGroomFitSettings = (settings: ArGroomFitSettings): boolean =>
  (settings.groom_color === "" || /^#[0-9a-f]{6}$/i.test(settings.groom_color)) &&
  Object.entries(GROOM_FIT_RANGES).every(([key, range]) => {
    const value = settings[key as keyof typeof GROOM_FIT_RANGES];
    return Number.isFinite(value) && value >= range.min && value <= range.max;
  });

interface PreviousGroomFit {
  groom: string;
  settings: ArGroomFitSettings;
}

type GroomFitCommand = { type: "fit"; groom?: string } & Partial<ArGroomFitSettings>;

export const buildGroomFitCommand = (
  groom: string,
  settings: ArGroomFitSettings,
  previous: PreviousGroomFit | null
): GroomFitCommand | null => {
  const command: GroomFitCommand = { type: "fit" };
  if (!previous || previous.groom !== groom) command.groom = groom;
  // 새 groom은 자체 기본 fit을 가질 수 있으므로 사용자 조정값은 함께 다시 보낸다.
  const previousSettings =
    previous && (previous.groom === groom || groom === "")
      ? previous.settings
      : DEFAULT_GROOM_FIT_SETTINGS;
  if (settings.groom_color !== previousSettings.groom_color)
    command.groom_color = settings.groom_color;
  for (const key of Object.keys(GROOM_FIT_RANGES) as (keyof typeof GROOM_FIT_RANGES)[]) {
    if (settings[key] !== previousSettings[key]) command[key] = settings[key];
  }
  return Object.keys(command).length > 1 ? command : null;
};

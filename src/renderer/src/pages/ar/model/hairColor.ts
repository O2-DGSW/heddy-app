import { DEFAULT_AR_HAIR_COLOR } from "./constants";

export interface HairColorHsl {
  hue: number;
  saturation: number;
  lightness: number;
}

export const hexToHairColorHsl = (hex: string): HairColorHsl => {
  const color = /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_AR_HAIR_COLOR;
  const red = parseInt(color.slice(1, 3), 16) / 255;
  const green = parseInt(color.slice(3, 5), 16) / 255;
  const blue = parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  if (delta > 0) {
    if (max === red) hue = ((green - blue) / delta + 6) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
  }
  return {
    hue: hue * 60,
    saturation: delta === 0 ? 0 : (delta / (1 - Math.abs(2 * lightness - 1))) * 100,
    lightness: lightness * 100,
  };
};

export const hairColorHslToHex = ({ hue, saturation, lightness }: HairColorHsl): string => {
  const light = lightness / 100;
  const amplitude = (saturation / 100) * Math.min(light, 1 - light);
  const channel = (offset: number) => {
    const position = (offset + hue / 30) % 12;
    const value = light - amplitude * Math.max(-1, Math.min(position - 3, 9 - position, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
};

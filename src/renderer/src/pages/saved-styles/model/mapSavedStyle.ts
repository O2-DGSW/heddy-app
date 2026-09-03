import type { SavedStyleResponse } from "@/entities/saved-style";

import type { SavedStyleItem } from "./types";

/** 색을 고르지 않고 저장한 후보는 색상 칩을 그리지 않는다 */
export const mapSavedStyleToItem = (savedStyle: SavedStyleResponse): SavedStyleItem => ({
  id: savedStyle.saved_style_id,
  hairstyleId: savedStyle.hairstyle_id ?? null,
  name: savedStyle.style_name,
  colorName: savedStyle.color?.name ?? "",
  colorHex: savedStyle.color?.hex_code ?? "",
  imageUrl: savedStyle.image_url ?? "",
});

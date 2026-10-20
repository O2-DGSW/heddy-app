import { expect, test } from "vitest";

import type { RecommendationApiData } from "@/entities/recommendation";
import { mapRecommendationToItems } from "./mapRecommendation";

const buildRecommendation = (groom?: string | null): RecommendationApiData => ({
  recommendation_run_id: "10000000-0000-4000-8000-000000000001",
  items: [
    {
      rank: 1,
      hairstyle: {
        hairstyle_id: "20000000-0000-4000-8000-000000000001",
        style_name: "리프컷",
        ar_groom_name: groom,
      },
    },
  ],
});

test("카탈로그 UUID와 별도로 서버의 명시적 groom 매핑을 카드에 보존한다", () => {
  const [item] = mapRecommendationToItems(buildRecommendation("leaf-cut"));
  expect(item.id).toBe("20000000-0000-4000-8000-000000000001");
  expect(item.arGroomName).toBe("leaf-cut");
});

test.each([undefined, null, "", "   "])(
  "groom 매핑이 없으면 스타일 이름으로 추측하지 않는다: %s",
  groom => {
    const [item] = mapRecommendationToItems(buildRecommendation(groom));
    expect(item.styleName).toBe("리프컷");
    expect(item.arGroomName).toBeUndefined();
  }
);

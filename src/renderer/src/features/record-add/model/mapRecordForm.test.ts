import { describe, expect, test } from "vitest";

import { INITIAL_FORM_VALUES } from "@/entities/record";
import type { PhotoItem } from "@/entities/record";

import {
  mapFormValuesToCreateRequest,
  mapFormValuesToUpdateRequest,
  mapPhotoItemsToAddRequests,
} from "./mapRecordForm";

const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });

describe("mapFormValuesToCreateRequest", () => {
  test("빈 칸은 null로, 가격은 숫자만 남겨 통화와 함께 보낸다", () => {
    const request = mapFormValuesToCreateRequest(
      {
        ...INITIAL_FORM_VALUES,
        date: "2026-03-05",
        salon: "  헤디 미용실 ",
        price: "35,000원",
        duration: "90",
      },
      ["#커트", "#염색"],
      4.5
    );

    expect(request).toMatchObject({
      service_types: ["CUT", "COLOR"],
      salon_name: "헤디 미용실",
      designer_name: null,
      satisfaction: 4.5,
      duration_minutes: 90,
      price_amount: 35000,
      price_currency: "KRW",
      memo: null,
    });
    expect(new Date(request.performed_at).getDate()).toBe(5);
  });

  test("만족도를 고르지 않았거나 가격이 없으면 보내지 않는다", () => {
    const request = mapFormValuesToCreateRequest(
      { ...INITIAL_FORM_VALUES, date: "2026-03-05" },
      [],
      0
    );

    expect(request.satisfaction).toBeNull();
    expect(request.price_amount).toBeNull();
    expect(request.price_currency).toBeNull();
  });
});

describe("mapFormValuesToUpdateRequest", () => {
  test("화면에서 고를 수 없는 시술 종류는 함께 보내 지워지지 않게 한다", () => {
    const request = mapFormValuesToUpdateRequest(INITIAL_FORM_VALUES, ["#펌"], 0, ["BLEACH"]);

    expect(request.service_types).toEqual(["PERM", "BLEACH"]);
    expect(request).not.toHaveProperty("satisfaction");
    expect(request).not.toHaveProperty("performed_at");
  });
});

describe("mapPhotoItemsToAddRequests", () => {
  test("새로 고른 사진만 요청으로 바꾸고 순서는 전체 목록 기준이다", () => {
    const photos: PhotoItem[] = [
      { id: "new-1", src: "blob:1", isObjectUrl: true, file },
      { id: "saved", src: "https://example.test/a.jpg", isObjectUrl: false },
      { id: "new-2", src: "blob:2", isObjectUrl: true, file },
    ];

    expect(mapPhotoItemsToAddRequests(photos)).toEqual([
      { file, image_type: "AFTER", sort_order: 0 },
      { file, image_type: "AFTER", sort_order: 2 },
    ]);
  });
});

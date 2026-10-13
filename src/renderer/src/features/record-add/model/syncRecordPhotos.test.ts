import { beforeEach, describe, expect, test, vi } from "vitest";

import type { PhotoItem } from "@/entities/record";

const api = vi.hoisted(() => ({
  addTreatmentRecordPhotoApi: vi.fn(),
  deleteTreatmentRecordPhotoApi: vi.fn(),
  updateTreatmentRecordPhotoApi: vi.fn(),
}));

vi.mock("@/entities/record", () => api);

import { syncRecordPhotos } from "./syncRecordPhotos";

const file = new File(["x"], "new.jpg", { type: "image/jpeg" });
const saved = (id: string): PhotoItem => ({
  id,
  src: `https://example.test/${id}`,
  isObjectUrl: false,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe("syncRecordPhotos", () => {
  test("뺀 사진은 지우고, 새 사진은 화면 순서대로 붙이고, 자리가 바뀐 사진만 순서를 고친다", async () => {
    const calls: string[] = [];
    api.deleteTreatmentRecordPhotoApi.mockImplementation(async (_recordId, photoId) => {
      calls.push(`delete:${photoId}`);
    });
    api.addTreatmentRecordPhotoApi.mockImplementation(async (_recordId, { sort_order }) => {
      calls.push(`add:${sort_order}`);
    });
    api.updateTreatmentRecordPhotoApi.mockImplementation(async (_recordId, photoId, body) => {
      calls.push(`update:${photoId}:${body.sort_order}`);
    });

    await syncRecordPhotos({
      recordId: "record-1",
      initialPhotos: [saved("a"), saved("b"), saved("c")],
      photos: [{ id: "new", src: "blob:new", isObjectUrl: true, file }, saved("a"), saved("c")],
    });

    // 지우기가 먼저여야 10장 제한에 걸리지 않는다. c는 원래도 2번째 자리라 순서를 고치지 않는다
    expect(calls).toEqual(["delete:b", "add:0", "update:a:1"]);
  });

  test("바뀐 게 없으면 서버에 아무 요청도 보내지 않는다", async () => {
    const photos = [saved("a"), saved("b")];

    await syncRecordPhotos({ recordId: "record-1", initialPhotos: photos, photos });

    expect(api.deleteTreatmentRecordPhotoApi).not.toHaveBeenCalled();
    expect(api.addTreatmentRecordPhotoApi).not.toHaveBeenCalled();
    expect(api.updateTreatmentRecordPhotoApi).not.toHaveBeenCalled();
  });
});

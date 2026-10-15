import { describe, expect, test } from "vitest";

import { compressPhotoFile, compressPhotoFiles } from "./compressPhotoFile";

describe("compressPhotoFile", () => {
  test("이미지가 아니면 그대로 돌려준다", async () => {
    const file = new File(["text"], "note.txt", { type: "text/plain" });

    await expect(compressPhotoFile(file)).resolves.toBe(file);
  });

  test("이미 충분히 작은 사진은 압축하지 않는다", async () => {
    const file = new File([new Uint8Array(1024)], "small.jpg", { type: "image/jpeg" });

    await expect(compressPhotoFile(file)).resolves.toBe(file);
  });

  test("압축에 실패하면 원본으로 대신한다", async () => {
    // Node에는 Image가 없어 이미지 로드가 실패한다 — 실패 경로가 원본을 돌려주는지 확인한다
    const file = new File([new Uint8Array(2 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });

    await expect(compressPhotoFile(file)).resolves.toBe(file);
  });
});

describe("compressPhotoFiles", () => {
  test("여러 장을 처리해도 고른 순서를 지킨다", async () => {
    const files = ["a", "b", "c", "d", "e"].map(
      name => new File([name], `${name}.txt`, { type: "text/plain" })
    );

    await expect(compressPhotoFiles(files)).resolves.toEqual(files);
  });

  test("빈 목록은 빈 목록을 돌려준다", async () => {
    await expect(compressPhotoFiles([])).resolves.toEqual([]);
  });
});

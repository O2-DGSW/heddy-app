// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";

import RecordPhotoUploader from ".";

import type { PhotoItem } from "../../model";

const renderUploader = (props: { photos?: PhotoItem[]; processingPhotoCount?: number } = {}) => {
  const photos = props.photos ?? [];

  render(
    <RecordPhotoUploader
      inputRef={createRef<HTMLInputElement>()}
      isPhotoLimitReached={photos.length >= 10}
      onOpenPhotoPicker={vi.fn()}
      onPhotoSelection={vi.fn()}
      onRemovePhoto={vi.fn()}
      photos={photos}
      processingPhotoCount={props.processingPhotoCount}
    />
  );
};

const createPhotos = (count: number): PhotoItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    src: `blob:${index}`,
    isObjectUrl: true,
  }));

describe("RecordPhotoUploader", () => {
  afterEach(cleanup);

  test("압축 중인 사진 수만큼 준비 중 칸을 그린다", () => {
    renderUploader({ processingPhotoCount: 2 });

    expect(screen.getAllByRole("img", { name: "사진 준비 중" })).toHaveLength(2);
  });

  test("10장이 차면 추가 버튼을 끄고 이유를 보여 준다", () => {
    renderUploader({ photos: createPhotos(10) });

    expect(screen.getByRole("button", { name: "사진 추가" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("사진은 최대 10장까지 올릴 수 있어요.")).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import HomeImage from "./HomeImage";
import RecentRecordCard from "./RecentRecordCard";
import RecommendationCard from "./RecommendationCard";

afterEach(cleanup);

const deferDecode = (image: HTMLElement) => {
  let finish: () => void = () => {};
  let fail: () => void = () => {};
  const promise = new Promise<void>((resolve, reject) => {
    finish = resolve;
    fail = () => reject(new Error("decode failed"));
  });
  Object.defineProperty(image, "decode", { configurable: true, value: () => promise });
  return { finish, fail };
};

test("다운로드가 끝나도 디코딩이 완료될 때까지 이미지를 숨긴다", async () => {
  render(<HomeImage src="/record.webp" alt="기록 사진" />);
  const image = screen.getByRole("img", { name: "기록 사진" });
  const decode = deferDecode(image);

  expect(image.classList.contains("opacity-0")).toBe(true);
  fireEvent.load(image);
  expect(image.classList.contains("opacity-0")).toBe(true);

  await act(async () => decode.finish());
  expect(image.classList.contains("opacity-100")).toBe(true);
});

test("새 URL로 바뀌면 이전 디코딩 완료를 무시하고 새 이미지가 준비되기를 기다린다", async () => {
  const { rerender } = render(<HomeImage src="/first.webp" alt="스타일" />);
  const firstImage = screen.getByRole("img");
  const firstDecode = deferDecode(firstImage);
  fireEvent.load(firstImage);

  rerender(<HomeImage src="/second.webp" alt="스타일" />);
  const secondImage = screen.getByRole("img");
  const secondDecode = deferDecode(secondImage);
  fireEvent.load(secondImage);
  await act(async () => firstDecode.finish());
  expect(secondImage.classList.contains("opacity-0")).toBe(true);

  await act(async () => secondDecode.finish());
  expect(secondImage.classList.contains("opacity-100")).toBe(true);

  rerender(<HomeImage src="/first.webp" alt="스타일" />);
  expect(screen.getByRole("img").classList.contains("opacity-0")).toBe(true);
});

test("다운로드 실패 후 다른 URL은 다시 불러올 수 있다", async () => {
  const { rerender } = render(<HomeImage src="/broken.webp" alt="기록 사진" />);
  fireEvent.error(screen.getByRole("img"));
  expect(screen.getByRole("img", { name: "기록 사진: 사진 없음" })).toBeTruthy();

  rerender(<HomeImage src="/valid.webp" alt="기록 사진" />);
  const image = screen.getByRole("img", { name: "기록 사진" });
  const decode = deferDecode(image);
  fireEvent.load(image);
  await act(async () => decode.finish());
  expect(image.classList.contains("opacity-100")).toBe(true);
});

test("디코딩 실패는 사진 없음으로 처리한다", async () => {
  render(<HomeImage src="/invalid.webp" alt="기록 사진" />);
  const image = screen.getByRole("img");
  const decode = deferDecode(image);
  fireEvent.load(image);
  await act(async () => decode.fail());
  expect(screen.getByRole("img", { name: "기록 사진: 사진 없음" })).toBeTruthy();
});

test("사진 URL이 없으면 요청할 이미지 대신 안내를 표시한다", () => {
  const { container } = render(<HomeImage src=" " alt="기록 사진" />);
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByRole("img", { name: "기록 사진: 사진 없음" })).toBeTruthy();
});

test("최근 기록과 추천 썸네일은 지연 로딩 없이 요청한다", () => {
  render(
    <>
      <RecentRecordCard
        onClick={vi.fn()}
        onAddClick={vi.fn()}
        record={{
          id: "record-1",
          date: "2026-10-21",
          procedureName: "커트",
          salonName: "미용실",
          designerName: "디자이너",
          rating: 5,
          thumbnailUrl: "/record.webp",
        }}
      />
      <RecommendationCard
        onClick={vi.fn()}
        card={{
          id: "style-1",
          rank: 1,
          title: "추천 커트",
          imageUrl: "/style.webp",
          colorName: "",
          tags: [],
        }}
      />
    </>
  );
  expect(screen.getByRole("img", { name: "커트 시술 사진" }).getAttribute("loading")).toBe("eager");
  expect(screen.getByRole("img", { name: "추천 커트 추천 사진" }).getAttribute("loading")).toBe(
    "eager"
  );
});

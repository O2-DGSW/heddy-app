// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import type { ArHairstyleOption } from "@/entities/ar-groom";
import ArHairstyleBrowser from ".";

const options: ArHairstyleOption[] = [
  { name: "", label: "원본 스타일" },
  {
    name: "hippie-perm",
    label: "히피펌",
    gender: "공용",
    type: "펌",
    tags: ["긴 머리"],
    thumbUrl: "/grooms/hippie.png",
    viewsUrl: "/grooms/hippie-views.png",
  },
  { name: "short-perm", label: "숏펌", gender: "공용", type: "펌", tags: ["짧은 머리"] },
  { name: "bob", label: "보브컷", gender: "여성", type: "커트", tags: ["짧은 머리"] },
];

const setup = (disabled = false) => {
  const onSelect = vi.fn();
  const onDisabledSelect = vi.fn();
  render(
    <ArHairstyleBrowser
      activeHairstyleName="hippie-perm"
      disabled={disabled}
      hairstyleOptions={options}
      onClose={vi.fn()}
      onSelect={onSelect}
      onDisabledSelect={onDisabledSelect}
    />
  );
  return { onSelect, onDisabledSelect };
};

afterEach(cleanup);

test("성별·유형·태그를 함께 적용하고 초기화하면 전체 스타일을 복원한다", () => {
  const { onSelect } = setup();
  fireEvent.click(
    within(screen.getByRole("group", { name: "성별 필터" })).getByRole("button", { name: "공용" })
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "유형 필터" })).getByRole("button", {
      name: "펌",
      exact: true,
    })
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "태그 필터" })).getByRole("button", {
      name: "짧은 머리",
    })
  );

  expect(screen.queryByRole("button", { name: /히피펌/ })).toBeNull();
  expect(screen.queryByRole("button", { name: /보브컷/ })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /숏펌/ }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith("short-perm");

  fireEvent.click(screen.getByRole("button", { name: "필터 초기화" }));
  expect(screen.getByRole("button", { name: /히피펌/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /보브컷/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /원본 스타일/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "필터 초기화" })).toBeNull();
});

test("결과가 없는 필터 조합은 빈 상태를 표시한다", () => {
  setup();
  fireEvent.click(
    within(screen.getByRole("group", { name: "성별 필터" })).getByRole("button", { name: "여성" })
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "유형 필터" })).getByRole("button", {
      name: "펌",
      exact: true,
    })
  );
  expect(screen.getByRole("status").textContent).toBe("조건에 맞는 헤어스타일이 없습니다.");
});

test("연결 준비 전에는 카드 선택 대신 안내를 요청한다", () => {
  const { onSelect, onDisabledSelect } = setup(true);
  fireEvent.click(screen.getByRole("button", { name: /히피펌/ }));
  expect(onSelect).not.toHaveBeenCalled();
  expect(onDisabledSelect).toHaveBeenCalledOnce();
});

test("카드 표시 이름과 서버 선택 식별자를 구분하고 네 방향 이미지를 표시한다", () => {
  const { onSelect } = setup();
  expect(screen.getByRole("button", { name: /히피펌/ }).getAttribute("aria-pressed")).toBe("true");
  const views = screen.getAllByRole("img", { name: /히피펌 (정면|3\/4|옆|뒤) 미리보기/ });
  expect(views).toHaveLength(4);
  expect(views.map(view => view.style.backgroundPosition)).toEqual([
    "0% center",
    "33.33333333333333% center",
    "66.66666666666666% center",
    "100% center",
  ]);
  fireEvent.click(screen.getByRole("button", { name: /히피펌/ }));
  expect(onSelect).toHaveBeenCalledExactlyOnceWith("hippie-perm");
});

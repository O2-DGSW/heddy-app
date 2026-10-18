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
  const onClose = vi.fn();
  const view = render(
    <ArHairstyleBrowser
      activeHairstyleName="hippie-perm"
      disabled={disabled}
      hairstyleOptions={options}
      onClose={onClose}
      onSelect={onSelect}
      onDisabledSelect={onDisabledSelect}
    />
  );
  return { onSelect, onDisabledSelect, onClose, ...view };
};

afterEach(cleanup);

test("성별·유형·태그를 함께 적용하고 초기화하면 전체 스타일을 복원한다", () => {
  const { onSelect } = setup();
  fireEvent.click(screen.getByText("스타일 필터"));
  fireEvent.click(
    within(screen.getByRole("group", { name: "성별 필터" })).getByRole("button", { name: "공용" })
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "유형 필터" })).getByRole("button", {
      name: "펌",
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
  fireEvent.click(screen.getByText("스타일 필터"));
  fireEvent.click(
    within(screen.getByRole("group", { name: "성별 필터" })).getByRole("button", { name: "여성" })
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "유형 필터" })).getByRole("button", {
      name: "펌",
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

test("절반 높이로 열리고 손잡이와 키보드로 펼치기·접기·닫기를 지원한다", () => {
  const { onClose } = setup();
  const handle = screen.getByRole("button", { name: "헤어스타일 목록 펼치기" });
  expect(handle.parentElement?.style.height).toBe("52%");
  expect(document.activeElement).toBe(handle);
  fireEvent.click(handle);
  expect(handle.parentElement?.style.height).toBe("88%");
  fireEvent.keyDown(handle, { key: "ArrowDown" });
  expect(handle.parentElement?.style.height).toBe("52%");
  fireEvent.keyDown(handle, { key: "ArrowUp" });
  expect(handle.parentElement?.style.height).toBe("88%");
  fireEvent.keyDown(handle, { key: "Escape" });
  expect(onClose).toHaveBeenCalledOnce();
});

test("드래그를 완료하면 높이에 맞춰 펼치거나 접고 충분히 내리면 닫는다", () => {
  const { onClose } = setup();
  const handle = screen.getByRole("button", { name: "헤어스타일 목록 펼치기" });
  const panel = handle.parentElement;
  if (!panel?.parentElement) throw new Error("시트 컨테이너 없음");
  vi.spyOn(panel.parentElement, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 400, 800)
  );
  Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });
  const pointer = (type: string, y: number) =>
    fireEvent(
      handle,
      Object.assign(new Event(type, { bubbles: true }), {
        pointerId: 1,
        button: 0,
        isPrimary: true,
        clientY: y,
      })
    );
  pointer("pointerdown", 450);
  pointer("pointermove", 200);
  pointer("pointerup", 200);
  expect(panel.style.height).toBe("88%");
  fireEvent.click(handle, { detail: 1 });
  expect(panel.style.height).toBe("88%");
  pointer("pointerdown", 200);
  pointer("pointermove", 450);
  pointer("pointerup", 450);
  expect(panel.style.height).toBe("52%");
  pointer("pointerdown", 450);
  pointer("pointermove", 650);
  pointer("pointerup", 650);
  expect(onClose).toHaveBeenCalledOnce();
});

test("드래그가 취소되면 원래 높이로 돌아오며 닫을 때 이전 포커스를 복원한다", () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const { onClose, unmount } = setup();
  const handle = screen.getByRole("button", { name: "헤어스타일 목록 펼치기" });
  const panel = handle.parentElement;
  if (!panel?.parentElement) throw new Error("시트 컨테이너 없음");
  vi.spyOn(panel.parentElement, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 400, 800)
  );
  Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });
  for (const [type, y] of [
    ["pointerdown", 400],
    ["pointermove", 100],
    ["pointercancel", 100],
  ] as const) {
    fireEvent(
      handle,
      Object.assign(new Event(type, { bubbles: true }), {
        pointerId: 1,
        button: 0,
        isPrimary: true,
        clientY: y,
      })
    );
  }
  expect(panel.style.height).toBe("52%");
  expect(onClose).not.toHaveBeenCalled();
  unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});

test("짧은 드래그로 위·중앙 위치를 오가며 터치의 후속 클릭과 늦은 프레임이 스냅을 되돌리지 않는다", () => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  try {
    setup();
    const handle = screen.getByRole("button", { name: "헤어스타일 목록 펼치기" });
    const panel = handle.parentElement;
    if (!panel?.parentElement) throw new Error("시트 컨테이너 없음");
    vi.spyOn(panel.parentElement, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 0, 400, 800)
    );
    Object.defineProperty(handle, "setPointerCapture", { value: vi.fn() });
    const pointer = (type: string, y: number) =>
      fireEvent(
        handle,
        Object.assign(new Event(type, { bubbles: true }), {
          pointerId: 1,
          button: 0,
          isPrimary: true,
          clientY: y,
        })
      );
    pointer("pointerdown", 450);
    pointer("pointermove", 430);
    pointer("pointermove", 410);
    // 여러 이동 이벤트는 다음 화면 프레임에 한 번 반영한다.
    expect(panel.style.height).toBe("52%");
    vi.advanceTimersByTime(16);
    expect(panel.style.height).toBe("57%");
    pointer("pointermove", 408);
    pointer("pointerup", 408);
    expect(panel.style.height).toBe("88%");
    fireEvent.click(handle, { detail: 0 });
    vi.advanceTimersByTime(32);
    expect(panel.style.height).toBe("88%");
    pointer("pointerdown", 200);
    pointer("pointermove", 240);
    pointer("pointerup", 240);
    expect(panel.style.height).toBe("52%");
    // 드래그 뒤에도 키보드로 의도한 펼치기는 동작한다.
    fireEvent.keyDown(handle, { key: "Enter" });
    fireEvent.click(handle, { detail: 0 });
    expect(panel.style.height).toBe("88%");
  } finally {
    vi.useRealTimers();
  }
});

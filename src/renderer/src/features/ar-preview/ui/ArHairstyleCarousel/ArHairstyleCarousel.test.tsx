// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ArHairstyleCarousel from ".";
import { ORIGINAL_HAIRSTYLE_OPTION } from "../../model/constants";

const options = Array.from({ length: 7 }, (_, index) => ({
  name: `style-${index}`,
  label: `스타일 ${index}`,
}));

const setup = (disabled = false) => {
  const onSelect = vi.fn();
  const onDisabledSelect = vi.fn();
  const view = render(
    <ArHairstyleCarousel
      activeHairstylePosition={0}
      hairstyleOptions={options}
      loadingMessage={null}
      disabled={disabled}
      onSelect={onSelect}
      onDisabledSelect={onDisabledSelect}
    />
  );
  return { ...view, carousel: view.getByLabelText("헤어스타일 선택"), onSelect, onDisabledSelect };
};

const advance = (time: number) => act(() => vi.advanceTimersByTime(time));

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("AR 캐러셀 연속 스크롤", () => {
  test("휠 입력 중 여러 바퀴를 지나가고 멈춘 위치만 적용한다", () => {
    const { carousel, onSelect } = setup();
    for (let index = 0; index < 50; index += 1) {
      fireEvent.wheel(carousel, { deltaX: 34 });
      advance(16);
    }
    expect(onSelect).not.toHaveBeenCalled();
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(20);
    expect(carousel.querySelector('[aria-pressed="true"]')?.getAttribute("aria-label")).toBe(
      "스타일 6 선택"
    );
  });

  test("반대 방향으로도 처음 항목을 넘어 순환한다", () => {
    const { carousel, onSelect } = setup();
    fireEvent.wheel(carousel, { deltaY: -850 });
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(-10);
    expect(carousel.querySelector('[aria-pressed="true"]')?.getAttribute("aria-label")).toBe(
      "스타일 4 선택"
    );
  });

  test("정렬 애니메이션 중 새 휠 입력이 이전 선택을 취소한다", () => {
    const { carousel, onSelect } = setup();
    fireEvent.wheel(carousel, { deltaX: 127.5 });
    advance(160);
    fireEvent.wheel(carousel, { deltaX: -297.5 });
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(-2);
  });

  test("연결 전에는 선택하지 않고 안내한다", () => {
    const { carousel, onSelect, onDisabledSelect } = setup(true);
    fireEvent.wheel(carousel, { deltaY: 850 });
    advance(1000);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onDisabledSelect).toHaveBeenCalledOnce();
  });

  test("언마운트하면 대기 중인 선택을 적용하지 않는다", () => {
    const { carousel, onSelect, unmount } = setup();
    fireEvent.wheel(carousel, { deltaX: 850 });
    unmount();
    advance(1000);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("공용 카메라 미리보기의 작은 캐러셀", () => {
  test("원본 스타일과 서버 썸네일을 표시하고 선택한 위치를 전달한다", () => {
    const onSelect = vi.fn();
    const view = render(
      <ArHairstyleCarousel
        compact
        activeHairstylePosition={0}
        hairstyleOptions={[
          ORIGINAL_HAIRSTYLE_OPTION,
          { name: "hippie-perm", label: "히피펌", thumbUrl: "/grooms/hippie-perm.png" },
        ]}
        loadingMessage={null}
        disabled={false}
        onSelect={onSelect}
      />
    );

    expect(
      view.getByRole("button", { name: "헤어스타일 적용 안 함" }).getAttribute("aria-pressed")
    ).toBe("true");
    expect(view.getByRole("img", { name: "히피펌" }).getAttribute("src")).toBe(
      "/grooms/hippie-perm.png"
    );
    fireEvent.click(view.getByRole("button", { name: "히피펌 선택" }));
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1);
  });

  test("카메라가 비활성 상태이면 원본 스타일을 선택해도 전달하지 않는다", () => {
    const onSelect = vi.fn();
    const view = render(
      <ArHairstyleCarousel
        compact
        activeHairstylePosition={0}
        hairstyleOptions={[ORIGINAL_HAIRSTYLE_OPTION]}
        loadingMessage={null}
        disabled
        onSelect={onSelect}
      />
    );

    fireEvent.click(view.getByRole("button", { name: "헤어스타일 적용 안 함" }));
    advance(1000);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

const pointer = (target: Element, type: string, x = 200, id = 1) => {
  const event = new MouseEvent(type, { bubbles: true, clientX: x, button: 0 });
  Object.defineProperties(event, {
    pointerId: { value: id },
    pointerType: { value: "touch" },
    isPrimary: { value: id === 1 },
    timeStamp: { value: performance.now() },
  });
  fireEvent(target, event);
};

describe("네이티브 터치 드래그", () => {
  test.each([-1, 1])("버튼의 캡처 해제가 버블링돼도 %s 방향으로 계속 넘긴다", direction => {
    const { carousel, onSelect } = setup();
    const button = carousel.querySelector('[aria-pressed="true"]');
    if (!button) throw new Error("선택된 스타일이 없습니다.");
    const capture = vi.fn(() => pointer(button, "lostpointercapture"));
    Object.defineProperty(carousel, "setPointerCapture", { value: capture });
    pointer(button, "pointerdown");
    advance(100);
    pointer(carousel, "pointermove", 200 - direction * 42.5);
    advance(100);
    pointer(carousel, "pointermove", 200 - direction * 85);
    advance(100);
    pointer(carousel, "pointerup", 200 - direction * 85);
    advance(1000);
    expect(capture).toHaveBeenCalledExactlyOnceWith(1);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(direction);
  });

  test("드래그 뒤 발생하는 클릭은 중복 선택하지 않고 다음 탭은 선택한다", () => {
    const { carousel, onSelect } = setup();
    Object.defineProperty(carousel, "setPointerCapture", { value: vi.fn() });
    pointer(carousel, "pointerdown");
    advance(100);
    pointer(carousel, "pointermove", 115);
    advance(100);
    pointer(carousel, "pointerup", 115);
    const button = carousel.querySelector('[aria-pressed="true"]');
    if (!button) throw new Error("선택된 스타일이 없습니다.");
    fireEvent.click(button);
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1);
    pointer(button, "pointerdown", 115);
    pointer(button, "pointerup", 115);
    fireEvent.click(button);
    advance(1000);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  test("다른 손가락의 취소 이벤트가 진행 중인 드래그를 중단하지 않는다", () => {
    const { carousel, onSelect } = setup();
    Object.defineProperty(carousel, "setPointerCapture", { value: vi.fn() });
    pointer(carousel, "pointerdown");
    pointer(carousel, "pointerdown", 200, 2);
    pointer(carousel, "pointercancel", 200, 2);
    advance(100);
    pointer(carousel, "pointermove", 115);
    advance(100);
    pointer(carousel, "pointerup", 115);
    advance(1000);
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1);
  });

  test.each(["pointercancel", "lostpointercapture"])(
    "캐러셀 자체 %s 이후의 이동은 무시한다",
    type => {
      const { carousel, onSelect } = setup();
      Object.defineProperty(carousel, "setPointerCapture", { value: vi.fn() });
      pointer(carousel, "pointerdown");
      advance(100);
      pointer(carousel, "pointermove", 115);
      pointer(carousel, type, 115);
      pointer(carousel, "pointermove", -140);
      pointer(carousel, "pointerup", -140);
      advance(1000);
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(1);
    }
  );

  test("연결 전 터치는 스타일을 적용하지 않고 안내한다", () => {
    const { carousel, onSelect, onDisabledSelect } = setup(true);
    pointer(carousel, "pointerdown");
    pointer(carousel, "pointermove", 30);
    pointer(carousel, "pointerup", 30);
    advance(1000);
    expect(onSelect).not.toHaveBeenCalled();
    expect(onDisabledSelect).toHaveBeenCalledOnce();
  });
});

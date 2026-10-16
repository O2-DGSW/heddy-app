// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ArHairstyleCarousel from ".";

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

// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

import Skeleton from ".";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(Element.prototype, "animate");
  vi.unstubAllGlobals();
});

test("불투명도 대신 수평 이동을 쓰며 설정 변경과 해제 시 애니메이션을 취소한다", () => {
  const cancel = vi.fn();
  const animate = vi.fn<(frames: Keyframe[]) => { cancel: () => void }>(() => ({ cancel }));
  Object.defineProperty(Element.prototype, "animate", { configurable: true, value: animate });
  let reduced = false;
  let listener: (() => void) | undefined;
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_event: string, callback: () => void) => {
      listener = callback;
    },
    removeEventListener: vi.fn(),
  }));
  const { unmount } = render(<Skeleton />);
  expect(animate.mock.calls[0]?.[0]).toEqual([
    { transform: "translateX(-100%)" },
    { transform: "translateX(100%)" },
  ]);
  reduced = true;
  listener?.();
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(animate).toHaveBeenCalledTimes(1);
  unmount();
});

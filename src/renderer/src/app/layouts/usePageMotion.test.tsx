// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, expect, test, vi } from "vitest";

import { usePageMotion } from "./usePageMotion";

const MotionOutlet = () => {
  const ref = useRef<HTMLElement>(null);
  usePageMotion(ref);
  return <cap-router-outlet ref={ref} />;
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("동작 줄이기를 변경하면 전환 시간과 스와이프 설정도 즉시 변경한다", () => {
  let isReduced = false;
  let listener: (() => void) | undefined;
  const remove = vi.fn();
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return isReduced;
    },
    addEventListener: (_event: string, callback: () => void) => {
      listener = callback;
    },
    removeEventListener: remove,
  }));
  const { container, unmount } = render(<MotionOutlet />);
  const outlet = container.querySelector("cap-router-outlet");
  expect(outlet?.getAttribute("platform")).toBe("ios");
  expect(outlet?.getAttribute("duration")).toBe("320");
  isReduced = true;
  listener?.();
  expect(outlet?.getAttribute("duration")).toBe("1");
  expect(outlet?.getAttribute("swipe-gesture")).toBe("false");
  isReduced = false;
  listener?.();
  expect(outlet?.getAttribute("duration")).toBe("320");
  unmount();
  expect(remove).toHaveBeenCalled();
});

// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";

import { useCameraConsent } from "./usePermissionNotice";

describe("useCameraConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("처음에는 동의 전이고, 동의하면 기억해 다음부터는 바로 카메라를 켠다", () => {
    const first = renderHook(() => useCameraConsent());
    expect(first.result.current.hasCameraConsent).toBe(false);

    act(() => first.result.current.handleCameraConsent());
    expect(first.result.current.hasCameraConsent).toBe(true);

    const next = renderHook(() => useCameraConsent());
    expect(next.result.current.hasCameraConsent).toBe(true);
  });
});

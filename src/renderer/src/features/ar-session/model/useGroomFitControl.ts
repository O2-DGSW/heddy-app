import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { buildGroomFitCommand, isValidGroomFitSettings } from "@/entities/ar-groom";
import type { ArGroomFitSettings, ArGroomState } from "@/entities/ar-groom";

import type { ArServerEvent } from "./arServerEvent";

type ArControlEvent = Exclude<ArServerEvent, { type: "stats" }>;

interface DesiredGroomFit {
  groom: string;
  settings: ArGroomFitSettings;
}

const GROOM_TIMEOUT_MS = 15000;
const FOREHEAD_TIMEOUT_MS = 60000;
// 슬라이더를 끄는 동안 명령이 쏟아지지 않게 마지막 값만 보낸다
const SYNC_DEBOUNCE_MS = 80;

/**
 * AR 서버 제어 채널로 스타일(groom)·맞춤값·이마 재생성 요청을 보내고 응답을 상태로 만든다.
 * 서버가 요청 ID를 주지 않아 스타일 요청은 하나씩 보내고, 그동안 바뀐 선택은 응답 뒤에 이어서 보낸다.
 */
export const useGroomFitControl = (
  channelRef: RefObject<RTCDataChannel | null>,
  groom: string,
  settings: ArGroomFitSettings
) => {
  const desiredFitRef = useRef<DesiredGroomFit>({ groom, settings });
  const lastSentFitRef = useRef<DesiredGroomFit | null>(null);
  const pendingGroomRef = useRef<string | null>(null);
  // 타임아웃 뒤에 늦게 도착한 스타일 응답을 화면 상태에 반영하려고, 타임아웃된 요청을 기억한다
  const timedOutFitRef = useRef<DesiredGroomFit | null>(null);
  const groomTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const foreheadTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [groomState, setGroomState] = useState<ArGroomState>({ status: "idle" });
  const [foreheadState, setForeheadState] = useState<ArGroomState>({ status: "idle" });

  const clearForeheadTimer = () => {
    clearTimeout(foreheadTimerRef.current);
    foreheadTimerRef.current = undefined;
  };

  const syncGroomFit = useCallback(() => {
    const channel = channelRef.current;
    const desired = desiredFitRef.current;
    if (channel?.readyState !== "open" || pendingGroomRef.current !== null) return;
    if (!isValidGroomFitSettings(desired.settings)) {
      setGroomState({
        groom: desired.groom,
        status: "error",
        message: "스타일 조정 값이 허용 범위를 벗어났습니다.",
      });
      return;
    }
    const command = buildGroomFitCommand(desired.groom, desired.settings, lastSentFitRef.current);
    if (!command) return;
    try {
      channel.send(JSON.stringify(command));
      lastSentFitRef.current = desired;
      if (command.groom === undefined) return;

      clearForeheadTimer();
      setForeheadState({ status: "idle" });
      // 서버는 groom 해제에 완료 알림을 보내지 않으므로 다음 스타일 요청을 막지 않는다.
      if (command.groom === "") {
        setGroomState({ groom: "", status: "idle" });
        return;
      }
      pendingGroomRef.current = desired.groom;
      timedOutFitRef.current = null;
      setGroomState({ groom: desired.groom, status: "loading" });
      clearTimeout(groomTimerRef.current);
      groomTimerRef.current = setTimeout(() => {
        pendingGroomRef.current = null;
        lastSentFitRef.current = null;
        timedOutFitRef.current = desired;
        setGroomState({
          groom: desiredFitRef.current.groom,
          status: "error",
          message: "스타일 적용 응답이 없습니다. 다시 시도해 주세요.",
        });
      }, GROOM_TIMEOUT_MS);
    } catch {
      lastSentFitRef.current = null;
      setGroomState({
        groom: desired.groom,
        status: "error",
        message: "스타일 변경 요청을 보내지 못했습니다.",
      });
    }
  }, [channelRef]);

  const startForeheadTimeout = useCallback(() => {
    clearTimeout(foreheadTimerRef.current);
    foreheadTimerRef.current = setTimeout(() => {
      foreheadTimerRef.current = undefined;
      setForeheadState({
        status: "error",
        message: "이마 생성 응답이 없습니다. 정면을 보고 다시 시도해 주세요.",
      });
    }, FOREHEAD_TIMEOUT_MS);
  }, []);

  const handleGroomRetry = useCallback(() => {
    if (pendingGroomRef.current !== null) return;
    lastSentFitRef.current = null;
    syncGroomFit();
  }, [syncGroomFit]);

  const handleForeheadRefresh = useCallback(() => {
    const channel = channelRef.current;
    if (
      channel?.readyState !== "open" ||
      !desiredFitRef.current.groom ||
      pendingGroomRef.current !== null ||
      foreheadTimerRef.current !== undefined
    )
      return;
    try {
      channel.send(JSON.stringify({ type: "fit", forehead: "refresh" }));
      setForeheadState({ status: "loading" });
      startForeheadTimeout();
    } catch {
      setForeheadState({ status: "error", message: "이마 재생성 요청을 보내지 못했습니다." });
    }
  }, [channelRef, startForeheadTimeout]);

  /** 서버의 스타일·이마·오류 이벤트를 상태에 반영한다 */
  const handleControlEvent = useCallback(
    (event: ArControlEvent) => {
      if (event.type === "groom") {
        const pending = pendingGroomRef.current;
        const timedOutFit = timedOutFitRef.current;
        // 타임아웃으로 오류 처리한 요청의 응답이 늦게 왔다면, 서버 실제 상태에 화면을 맞춘다
        if (
          pending === null &&
          timedOutFit !== null &&
          (event.groom === undefined || event.groom === timedOutFit.groom)
        ) {
          timedOutFitRef.current = null;
          if (event.status === "ok") {
            lastSentFitRef.current = timedOutFit;
            setGroomState({ groom: timedOutFit.groom, status: "ok" });
            syncGroomFit();
          }
          return;
        }
        if (pending === null || (event.groom !== undefined && event.groom !== pending)) return;
        clearTimeout(groomTimerRef.current);
        pendingGroomRef.current = null;
        setGroomState({
          groom: pending,
          status: event.status,
          message:
            event.message ??
            (event.status === "error" ? "스타일을 적용하지 못했습니다." : undefined),
        });
        if (desiredFitRef.current.groom !== pending || event.status === "ok") syncGroomFit();
        return;
      }

      if (event.type === "forehead") {
        if (!desiredFitRef.current.groom) return;
        setForeheadState({
          status: event.status,
          message:
            event.message ??
            (event.status === "error"
              ? "이마를 생성하지 못했습니다. 정면을 보고 다시 시도해 주세요."
              : undefined),
        });
        if (event.status === "loading") startForeheadTimeout();
        else clearForeheadTimer();
        return;
      }

      // 이름 없는 오류: 이마 요청만 진행 중이면 이마 오류, 아니면 스타일 오류로 본다
      if (pendingGroomRef.current === null && foreheadTimerRef.current !== undefined) {
        clearForeheadTimer();
        setForeheadState({ status: "error", message: event.message });
        return;
      }
      clearTimeout(groomTimerRef.current);
      pendingGroomRef.current = null;
      setGroomState({
        groom: desiredFitRef.current.groom,
        status: "error",
        message: event.message,
      });
    },
    [startForeheadTimeout, syncGroomFit]
  );

  /** 연결이 끊기면 보낸 요청·타이머·상태를 모두 비운다 */
  const reset = useCallback(() => {
    clearTimeout(groomTimerRef.current);
    clearForeheadTimer();
    pendingGroomRef.current = null;
    timedOutFitRef.current = null;
    lastSentFitRef.current = null;
    setGroomState({ status: "idle" });
    setForeheadState({ status: "idle" });
  }, []);

  useEffect(() => {
    desiredFitRef.current = { groom, settings };
    const timer = setTimeout(syncGroomFit, SYNC_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [groom, settings, syncGroomFit]);

  return {
    groomState,
    foreheadState,
    syncGroomFit,
    handleGroomRetry,
    handleForeheadRefresh,
    handleControlEvent,
    reset,
  };
};

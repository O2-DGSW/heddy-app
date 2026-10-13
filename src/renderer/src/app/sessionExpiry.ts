type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

// 동시에 여러 요청이 401로 실패해도 안내와 이동은 한 번만 한다
const NOTIFY_COOLDOWN_MS = 3000;
let lastNotifiedAt = 0;

export const subscribeSessionExpired = (listener: SessionExpiredListener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const notifySessionExpired = () => {
  const now = Date.now();

  if (now - lastNotifiedAt < NOTIFY_COOLDOWN_MS) {
    return;
  }

  lastNotifiedAt = now;
  listeners.forEach(listener => listener());
};

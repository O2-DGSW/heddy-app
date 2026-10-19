/**
 * 고지를 확인했는지 기기에 기억한다. 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는
 * 기억하지 못할 뿐 앱이 멈추지 않도록 실패를 삼킨다. 그때는 다음 실행에 다시 안내한다.
 */
export const readAcknowledged = (key: string): boolean => {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

export const writeAcknowledged = (key: string) => {
  try {
    window.localStorage.setItem(key, "true");
  } catch {
    // 기억하지 못해도 이번 실행에서는 동의한 상태로 진행한다.
  }
};

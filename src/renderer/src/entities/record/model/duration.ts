/**
 * 소요 시간 값은 폼 전체에서 "분 단위 숫자 문자열"로 다룬다.
 * 서버가 duration_minutes(분)를 주고받기 때문에, 화면 문구("1시간 30분")는 표시할 때만 만든다.
 */

/** 휠에 올릴 시간 후보. 아무리 긴 시술도 12시간을 넘지 않아 0~12시간으로 끊는다 */
export const DURATION_HOUR_OPTIONS = Array.from({ length: 13 }, (_, index) => index);

/** 휠에 올릴 분 후보. 1분 단위 0~59분이며, 60분은 1시간이라 시간 휠 몫으로 둔다 */
export const DURATION_MINUTE_STEP = 1;
export const DURATION_MINUTE_OPTIONS = Array.from(
  { length: 60 / DURATION_MINUTE_STEP },
  (_, index) => index * DURATION_MINUTE_STEP
);

/** 폼 값(분 문자열)을 휠에 쓸 시/분으로 쪼갠다. 값이 없거나 숫자가 아니면 0시간 0분으로 둔다. */
export const parseDurationValue = (durationValue: string) => {
  const totalMinutes = Number.parseInt(durationValue, 10);

  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return { hour: 0, minute: 0 };
  }

  return {
    hour: Math.min(Math.floor(totalMinutes / 60), DURATION_HOUR_OPTIONS.length - 1),
    minute: Math.floor((totalMinutes % 60) / DURATION_MINUTE_STEP) * DURATION_MINUTE_STEP,
  };
};

/** 휠에서 고른 시/분을 폼 값(분 문자열)으로 되돌린다. 0분이면 빈 값이라 서버에서 지워진다. */
export const createDurationValue = (hour: number, minute: number) => {
  const totalMinutes = hour * 60 + minute;

  return totalMinutes > 0 ? String(totalMinutes) : "";
};

/** "90" → "1시간 30분". 0에 해당하는 단위는 빼서 "30분", "2시간"처럼 짧게 만든다. */
export const formatDurationDisplay = (durationValue: string) => {
  const { hour, minute } = parseDurationValue(durationValue);

  if (hour === 0 && minute === 0) {
    return "";
  }

  return [hour > 0 ? `${hour}시간` : null, minute > 0 ? `${minute}분` : null]
    .filter(Boolean)
    .join(" ");
};

import { lightTheme } from "@heddy/design-tokens";

/**
 * 필수 입력 항목 표시.
 * 항목 제목 옆에 붙여, 저장을 눌러 에러가 뜨기 전에도 무엇을 꼭 채워야 하는지 보이게 한다.
 */
const RecordRequiredMark = () => (
  <span aria-label="필수 항목" style={{ color: lightTheme.status.error }}>
    {" *"}
  </span>
);

export default RecordRequiredMark;

import { font, lightTheme } from "@heddy/design-tokens";

/**
 * 분석 뒤에 사진이 바뀌어 결과가 지금 사진을 반영하지 않는 상태(STALE)를 알린다.
 * 결과 자체는 그대로 내려오므로 화면을 막지 않고 안내만 얹는다.
 */
export const CutsAnalysisStaleNotice = () => {
  return (
    <p
      className={`mx-4 mt-4 rounded-xl px-3 py-2 ${font.caption.regular}`}
      style={{
        backgroundColor: lightTheme.fill.normal,
        color: lightTheme.label.alternative,
      }}
    >
      분석한 뒤에 사진이 바뀌었어요. 아래 결과는 바뀌기 전 사진 기준이에요
    </p>
  );
};

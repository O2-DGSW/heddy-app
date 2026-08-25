import { lightTheme } from "@heddy/design-tokens";

import { PageTitle } from "@/shared";

export const RecommendHeader = () => {
  return (
    // 타이틀 자체(PageTitle) 여백은 페이지마다 다르게 손대지 않는다 — 아래쪽 여유 공간은
    // 이 페이지 헤더 영역(흰 배경 wrapper)의 몫으로 둬서, cuts처럼 다른 페이지 헤더와
    // 서로 다른 값이 필요해져도 PageTitle 자체는 그대로 공유할 수 있게 한다.
    <div className="shrink-0 pb-5" style={{ backgroundColor: lightTheme.background.normal }}>
      <PageTitle id="recommend-title">스타일 추천</PageTitle>
    </div>
  );
};

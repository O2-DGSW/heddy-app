# Heddy App Agent Guide

이 문서는 저장소에서 구현, 수정, 리뷰를 수행하는 에이전트의 기본 규칙이다. 사용자 요청과 충돌하면 사용자 요청을 우선하되, 충돌과 영향은 결과에 명시한다.

## 언어와 진행 설명

- 모든 진행 설명과 최종 답변은 한국어로 작성한다.
- 도구를 호출하기 전에 무엇을 확인하거나 수행하는지 한국어로 짧게 설명한다.
- 진행 설명은 간결하게 유지하고, 확인된 사실과 다음 작업을 구분한다.

## 1. 프로젝트 기준

- 앱: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Capacitor
- 앱 소스: `src/renderer/src`
- 공용 패키지: `packages/api`, `packages/design-tokens`
- 패키지 매니저: `pnpm`
- 경로 별칭 `@/`은 `src/renderer/src`를 가리킨다. renderer의 레이어와 slice를 참조할 때 public API와 함께 사용한다.
- UI 색상과 타이포그래피는 `@heddy/design-tokens`의 `lightTheme`, `palette`, `font`를 우선 사용한다.
- HTTP 공통 기능은 `@heddy/api`에 둔다. 앱 코드에서 Axios를 직접 생성하거나 설정하지 않는다.

## 2. 작업 원칙

1. 수정 전 관련 파일, public API인 `index.ts`, 설정 파일, `git status --short`를 확인한다.
2. 사용자가 만든 기존 변경을 되돌리거나 무관한 리팩터링을 섞지 않는다.
3. 새 구조를 발명하기보다 현재 FSD 구조와 워크스페이스 패키지를 확장한다.
4. 변경 범위에 맞게 `pnpm lint`, `pnpm build`, `pnpm format:check`를 실행한다.
5. 이 저장소에는 아직 테스트 스크립트가 없다. 실행하지 않은 테스트를 통과했다고 보고하지 않는다.

## 3. FSD 레이어

이 프로젝트는 `views` 대신 `pages`를 사용한다.

```text
app -> pages -> widgets -> features -> entities -> shared
```

- 상위 레이어는 자신보다 아래 레이어만 import할 수 있다.
- `pages`끼리, `widgets`끼리, `features`끼리, `entities`끼리 cross-import하지 않는다.
- 같은 slice 내부의 `ui`, `model`, `api`, `lib`, `assets` 간 상대 import는 허용한다.
- 다른 slice나 레이어를 사용할 때는 대상 slice의 `index.ts` public API를 통해 import한다.
- `app` 내부 구성 파일끼리의 import와 엔트리포인트 조립은 허용한다.
- `@heddy/design-tokens`, `@heddy/api`는 모든 FSD 레이어 아래의 기반 패키지로 취급한다. 두 패키지는 renderer의 FSD 레이어를 import하면 안 된다.
- 공통 재사용 코드가 생기면 `shared`에 둔다. 특정 비즈니스 개념이면 `entities`, 사용자 행동이면 `features`, 여러 기능을 조합한 독립 UI 블록이면 `widgets`, 라우트 화면이면 `pages`에 둔다.

Public API 예시:

```ts
// pages/record-add/index.ts
export { default as RecordAddPage } from "./ui/RecordAddPage";
```

내부 파일을 직접 참조하는 아래 형태는 사용하지 않는다.

```ts
import RecordAddPage from "../pages/record-add/ui/RecordAddPage";
```

## 4. 폴더와 컴포넌트

- FSD slice 폴더는 의미가 드러나는 kebab-case를 사용한다. 예: `record-add`, `nav-bar`.
- 재사용 컴포넌트는 `PascalCase/index.tsx` 구조를 사용한다. 예: `ui/RecordAddPage/index.tsx`.
- React 컴포넌트는 화살표 함수로 작성하고 파일 마지막에 default export한다.
- public API에서는 default 컴포넌트를 이름 있는 export로 다시 노출해도 된다.
- Props는 `interface ComponentNameProps`로 선언한다.
- union, mapped type, 함수 타입 등은 `type`으로 선언한다.
- 컴포넌트 내부 순서는 `hooks -> 파생 변수 -> handlers -> useEffect -> return`으로 유지한다.
- 렌더링과 무관한 상수와 순수 함수는 컴포넌트 밖에 둔다.
- 이벤트 핸들러는 `handleSubmit`, `handleClose`처럼 `handle` 접두사를 사용한다.
- 접근성 이름, label 연결, button의 `type`, 이미지 `alt`를 생략하지 않는다.

```tsx
interface RecordAddPageProps {
  initialDate?: string;
}

const RecordAddPage = ({ initialDate }: RecordAddPageProps) => {
  const navigate = useNavigate();
  const date = initialDate ?? "";

  const handleClose = () => {
    navigate(-1);
  };

  return <main>{date}</main>;
};

export default RecordAddPage;
```

## 5. 타입 안전성

- `any`, `as any`, 암묵적 `any`를 사용하지 않는다. 외부 입력은 `unknown`으로 받고 검증하거나 좁힌다.
- 타입 import는 `import type`을 사용한다.
- 상태 union은 `StatusType` 접미사를 사용한다. 예: `AuthStatusType`.
- 폼 검증 스키마는 `ExampleFormSchema`, 스키마에서 추론한 값은 `ExampleFormValues`로 명명한다.
- 컴포넌트 Props는 `ComponentNameProps`, API 요청/응답은 `GetRecordRequest`, `GetRecordResponse`처럼 목적을 드러낸다.
- API 함수의 인자와 반환 타입을 명시하고 `ApiResponse<TData>`의 `TData`를 구체적으로 지정한다.
- 불필요한 단언(`as`)과 non-null assertion(`!`) 대신 guard를 사용한다.

## 6. API와 데이터 페칭

- renderer에서 `axios`를 직접 import하거나 `axios.create`를 호출하지 않는다.
- HTTP 요청은 `@heddy/api`가 export하는 `get`, `post`, `patch`, `put`, `del` 래퍼를 사용한다.
- 현재 래퍼가 없다면 endpoint 구현 전에 `packages/api`에 타입 안전한 래퍼를 추가하고 루트 `index.ts`에서 export한다. 앱에서 임시로 raw Axios를 우회 사용하지 않는다.
- 서버 상태는 TanStack Query를 사용하고, query key는 리소스별 객체 팩토리로 관리한다.
- 조회 hook은 `useGet<Resource>`, 생성은 `usePost<Resource>`, 수정은 `usePatch<Resource>` 또는 `usePut<Resource>`, 삭제는 `useDelete<Resource>`로 명명한다.
- query hook 파일은 `useGetRecord.query.ts`, mutation hook 파일은 `usePostRecord.mutation.ts`처럼 역할을 표시한다.
- API 호출 함수는 `entities/<resource>/api`, 사용자 행동을 조합하는 mutation은 필요에 따라 `features/<action>/api`에 둔다.

```ts
export const recordQueryKeys = {
  all: ["record"] as const,
  lists: () => [...recordQueryKeys.all, "list"] as const,
  detail: (recordId: string) => [...recordQueryKeys.all, "detail", recordId] as const,
};
```

## 7. 보안과 환경변수

- API 키, 토큰, 비밀번호, 운영 URL을 소스에 하드코딩하지 않는다.
- 이 프로젝트는 Vite이므로 클라이언트 환경변수 접두사는 `VITE_`다. `NEXT_PUBLIC_`을 사용하지 않는다.
- `VITE_` 변수는 번들에 포함되어 사용자에게 공개된다. 비밀값을 넣지 않는다.
- 환경변수 접근은 가능한 한 한 모듈에서 검증하고, 누락된 필수값은 명확한 오류로 처리한다.
- `dangerouslySetInnerHTML`은 사용하지 않는다. 불가피하면 신뢰 경계와 sanitization을 함께 구현하고 사유를 기록한다.
- 사용자 입력을 URL, HTML, 네이티브 브리지 호출에 전달할 때 검증한다.

## 8. 스타일과 디자인 시스템

- 레이아웃과 시각 스타일은 Tailwind CSS로 작성한다. CSS Module, styled-components, 새 전역 CSS 규칙을 추가하지 않는다.
- 색상과 타이포그래피는 `@heddy/design-tokens`를 사용한다. 토큰이 있는데 임의 hex, rgb, font-size를 하드코딩하지 않는다.
- 인라인 `style`은 지양한다. 현재 TS 토큰 구조상 Tailwind class로 표현할 수 없는 동적 토큰 값, SVG `currentColor`, 런타임 계산값에만 제한적으로 허용한다.
- 같은 토큰 인라인 스타일이 반복되면 CSS 변수 또는 Tailwind theme 연결을 공용 계층에 추가한다.
- 조건부 class는 문자열 삼항식 대신 공용 `cn()`을 사용한다.
- 현재 `cn` 유틸리티가 없다면 첫 사용 시 `shared/lib/cn`에 만들고 public API로 export한다. 필요한 의존성은 저장소에 명시적으로 추가한다.
- 두 개 이상의 독립 variant 또는 compound variant가 있는 재사용 컴포넌트는 CVA를 사용한다. 단순 boolean 한 개 때문에 CVA를 도입하지 않는다.
- Figma 구현에서는 제공된 SVG/이미지를 재사용하고, 임의로 비슷한 아이콘을 다시 그리지 않는다.
- 모바일 화면은 기존 `MobileLayout`, safe area, 하단 navigation 영역, 스크롤 동작을 고려한다.

## 9. 리뷰 절차

리뷰 요청에서는 코드를 수정하지 않고 다음 순서로 검토한다. 사용자가 수정까지 요청한 경우에만 고친다.

1. `git status --short`로 tracked, staged, untracked 범위를 확인한다.
2. 가능하면 `git diff main...HEAD`로 브랜치 변경을 확인한다.
3. 작업 트리 변경은 `git diff`, staged 변경은 `git diff --cached`로 추가 확인한다.
4. untracked 파일은 diff에 나오지 않으므로 파일을 직접 열어 검토한다.
5. 변경된 각 파일을 아래 체크리스트로 검토한다.
6. 관련 `index.ts`, 호출부, 타입, API 계약도 함께 확인한다.
7. 가능한 범위에서 `pnpm lint`, `pnpm build`, `pnpm format:check`를 실행한다.

리뷰 체크리스트:

- FSD import 방향, 같은 레이어 cross-import, public API barrel 준수
- 화살표 함수와 default export, Props interface, 컴포넌트 내부 순서, 폴더 규칙 준수
- `any` 미사용, 타입 네이밍, API 요청/응답 타입 명시
- `@heddy/api` 래퍼, query key 객체, query/mutation hook 네이밍 준수
- 비밀값 하드코딩, 공개 환경변수 오용, XSS 위험 없음
- Tailwind, 디자인 토큰, `cn()`, CVA 사용 기준 준수
- 사용자 흐름, 접근성, 로딩/에러/빈 상태, 모바일 레이아웃 회귀 여부

## 10. 리뷰 보고 형식

- 발견 사항을 요약보다 먼저, 심각도 순서로 제시한다: `P0` 치명적, `P1` 높음, `P2` 보통, `P3` 낮음.
- 각 발견 사항에 반드시 파일 경로와 1-based 라인 번호를 적는다.
- 문제의 증상, 발생 조건, 실제 영향을 짧고 구체적으로 설명한다.
- 추측은 사실처럼 쓰지 말고 확인이 필요한 가정을 명시한다.
- 문제가 없으면 `발견된 문제 없음`이라고 분명히 쓰고, 실행하지 못한 검증이나 잔여 위험을 덧붙인다.
- 마지막에만 짧은 변경 요약과 테스트 결과를 적는다.

```text
[P1] 저장 실패가 사용자에게 전달되지 않음
src/renderer/src/features/record-add/model/usePostRecord.mutation.ts:42
mutation 오류를 처리하지 않아 저장 버튼이 계속 성공한 것처럼 보입니다. 네트워크 오류 시 입력을 유지하고 오류 상태를 표시해야 합니다.
```

## 11. 완료 기준

- 요청 범위의 구현이 끝났고 관련 public API와 import가 정리되어 있다.
- 디자인 토큰과 기존 레이아웃 규칙을 따르며 주요 모바일 viewport에서 깨지지 않는다.
- 타입 오류와 lint 오류가 없다.
- 실행한 검증과 실행하지 못한 검증을 결과에 정확히 보고한다.

## 12. Final Report

작업 완료 후 다음 순서로 보고한다.

1. 발견한 문제
2. 변경한 내용
3. 테스트 결과
4. 변경하지 않은 부분

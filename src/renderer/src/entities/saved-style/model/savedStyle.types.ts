export type HairColorResponse = {
  color_id: string;
  /** 표시명과 무관하게 고정된 식별 코드. 클라이언트 분기와 AR 매핑에 쓴다 */
  code: string;
  name: string;
  /** 색상 칩의 점 색. #RRGGBB 형태다 */
  hex_code: string;
};

export type SavedStyleResponse = {
  /** 후보 식별자. 공유 대상 지정과 삭제에 쓴다 */
  saved_style_id: string;
  /** 카탈로그 스타일 식별자. AR로 다시 체험할 때 넘긴다. 예전 후보는 null일 수 있다 */
  hairstyle_id?: string | null;
  /** 저장 당시의 스타일 이름. 카탈로그가 바뀌어도 흔들리지 않는다 */
  style_name: string;
  /** 선택한 색상. 색을 고르지 않고 저장했으면 null */
  color?: HairColorResponse | null;
  /** AR 캡처가 있으면 그 캡처를, 없으면 카탈로그 썸네일을 짧은 만료의 Presigned GET으로 발급 */
  image_url?: string | null;
  memo?: string | null;
  created_at: string;
};

export type SavedStylesResponse = {
  /** 최신 저장순. 저장한 후보가 없으면 빈 배열이다 */
  items: SavedStyleResponse[];
};

export type SaveStyleRequest = {
  /** 카탈로그 스타일 식별자. 내려간 스타일은 404 */
  hairstyle_id: string;
  color_id?: string;
  /** 업로드를 마친(READY) AR_CAPTURE 파일. 생략하면 카탈로그 썸네일이 카드에 쓰인다 */
  capture_id?: string;
  /** 최대 500자 */
  memo?: string;
};

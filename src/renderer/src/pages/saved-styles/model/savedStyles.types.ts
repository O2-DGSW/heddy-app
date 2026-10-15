export interface SavedStyleItem {
  /** 후보 식별자. 삭제와 공유 대상 지정에 쓴다 */
  id: string;
  /** 카탈로그 스타일 식별자. AR로 다시 체험할 때 넘긴다. 예전 후보는 없을 수 있다 */
  hairstyleId: string | null;
  name: string;
  /** 색상 이름. 색을 고르지 않고 저장했으면 빈 문자열이라 칩을 그리지 않는다 */
  colorName: string;
  colorHex: string;
  /** 미리보기 사진. 없으면 카드에 빈 자리로 둔다 */
  imageUrl: string;
}

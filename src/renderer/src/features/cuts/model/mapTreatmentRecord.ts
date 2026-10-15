import { formatServiceTypes, getTreatmentRecordThumbnailUrl, toDateValue } from "@/entities/record";
import type { ServiceType, TreatmentRecordSummaryApiData } from "@/entities/record";
import type {
  CutsAnalysisStatus,
  CutsCategory,
  CutsRecord,
} from "@/features/cuts/model/types/CutsRecord.types";

/**
 * 카테고리 칩을 목록 조회 파라미터(service_type)로 바꾼다.
 * 서버는 service_type을 하나만 받기 때문에 칩 하나당 시술 종류 하나만 대응시킨다
 * (염색 칩은 COLOR만 조회하며, 탈색 BLEACH은 "전체"에서만 보인다).
 */
export const SERVICE_TYPE_BY_CATEGORY: Record<CutsCategory, ServiceType> = {
  커트: "CUT",
  펌: "PERM",
  염색: "COLOR",
  클리닉: "CLINIC",
};

/**
 * 카테고리 필터(커트·펌·염색·클리닉)에 대응하는 시술 종류.
 * 탈색·스타일링·기타는 대응하는 필터 칩이 없어 목록에서 "전체"로만 보인다.
 */
const CATEGORY_BY_SERVICE_TYPE: Partial<Record<ServiceType, CutsCategory>> = {
  CUT: "커트",
  PERM: "펌",
  COLOR: "염색",
  BLEACH: "염색",
  CLINIC: "클리닉",
};

/**
 * 서버 분석 상태 → 화면 배지.
 * 스펙에 값이 정의돼 있지 않아(분석 기능 연결 전까지 null) 예상되는 값만 매핑하고,
 * 모르는 값은 null로 두어 잘못된 배지를 띄우지 않는다. 실제 값이 정해지면 여기만 고치면 된다.
 */
const ANALYSIS_STATUS_BY_API_VALUE: Record<string, CutsAnalysisStatus> = {
  COMPLETED: "분석 완료",
  DONE: "분석 완료",
  SUCCEEDED: "분석 완료",
  IN_PROGRESS: "분석 중",
  PROCESSING: "분석 중",
  PENDING: "분석 중",
  RETAKE: "재촬영",
  FAILED: "재촬영",
};

/**
 * 목록 API 응답 한 건을 카드에서 쓰는 형태로 변환한다.
 * 서버에 시술명 필드가 없어 시술 종류를 이어 붙여 제목으로 사용한다.
 */
export const mapTreatmentRecordToCutsRecord = (item: TreatmentRecordSummaryApiData): CutsRecord => {
  const serviceTypes = item.service_types ?? [];

  return {
    id: item.record_id,
    date: toDateValue(item.performed_at),
    // 서버에 시술명 필드가 없어 시술 종류를 이어 붙여 제목으로 쓴다.
    procedureName: formatServiceTypes(serviceTypes),
    salonName: item.salon_name ?? "",
    designerName: item.designer_name ?? "",
    rating: item.satisfaction ?? 0,
    thumbnailUrl: getTreatmentRecordThumbnailUrl(item),
    category: serviceTypes.map(type => CATEGORY_BY_SERVICE_TYPE[type]).find(Boolean) ?? null,
    analysisStatus: item.analysis_status
      ? (ANALYSIS_STATUS_BY_API_VALUE[item.analysis_status.toUpperCase()] ?? null)
      : null,
    isSharing: item.is_shared ?? false,
  };
};

import { createDateValue, parseDateValue } from "@/entities/record/model/date";
import type { ProcedureType } from "@/entities/record/model/constants";
import type { PhotoItem, RecordFormValues } from "@/entities/record/model/types";
import type {
  CreateTreatmentRecordRequest,
  ServiceType,
  TreatmentRecordDetailApiData,
  TreatmentRecordPhotoApiData,
  UpdateTreatmentRecordRequest,
} from "@/entities/record/model/treatmentRecord.types";

const PRICE_CURRENCY = "KRW";

/** 폼의 시술 종류(#커트)와 서버 값(CUT)을 잇는다. 폼에는 4종만 있어 그 밖은 커트로 되돌린다. */
const SERVICE_TYPE_BY_PROCEDURE_TYPE: Record<ProcedureType, ServiceType> = {
  "#커트": "CUT",
  "#펌": "PERM",
  "#염색": "COLOR",
  "#클리닉": "CLINIC",
};

const PROCEDURE_TYPE_BY_SERVICE_TYPE: Partial<Record<ServiceType, ProcedureType>> = {
  CUT: "#커트",
  PERM: "#펌",
  COLOR: "#염색",
  CLINIC: "#클리닉",
};

/** ISO 8601 시술일시를 폼이 쓰는 YYYY-MM-DD로 바꾼다(기기 시간대 기준) */
const toFormDate = (performedAt: string) => {
  const performedDate = new Date(performedAt);

  if (Number.isNaN(performedDate.getTime())) {
    return "";
  }

  return createDateValue(
    performedDate.getFullYear(),
    performedDate.getMonth() + 1,
    performedDate.getDate()
  );
};

/** 폼의 YYYY-MM-DD를 서버가 받는 ISO 8601로 되돌린다. 시각 정보가 없어 그날 정오로 맞춘다. */
const toPerformedAt = (formDate: string) => {
  const { year, month, day } = parseDateValue(formDate);
  const performedDate = new Date(year, month - 1, day, 12, 0, 0);

  return performedDate.toISOString();
};

const getTodayDateValue = () => {
  const today = new Date();

  return createDateValue(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

/** 숫자만 남겨 가격으로 쓴다. 값이 없거나 숫자가 아니면 null로 보내 서버에서 지운다. */
const toPriceAmount = (price: string) => {
  const digitsOnly = price.replace(/[^0-9]/g, "");

  return digitsOnly ? Number(digitsOnly) : null;
};

const hasPhotoUrl = (
  photo: TreatmentRecordPhotoApiData
): photo is TreatmentRecordPhotoApiData & { photo_url: string } =>
  typeof photo.photo_url === "string" && photo.photo_url.length > 0;

/** 서버 상세 응답을 수정 폼의 초기값으로 바꾼다 */
export const mapDetailToFormValues = (detail: TreatmentRecordDetailApiData): RecordFormValues => ({
  date: toFormDate(detail.performed_at),
  salon: detail.salon_name ?? "",
  price: detail.price ? String(detail.price.amount) : "",
  // 소요 시간과 시술 내용은 서버에 저장되는 필드가 없어 비워 둔다.
  duration: "",
  designer: detail.designer_name ?? "",
  procedureContent: "",
  details: detail.memo ?? "",
});

export const mapDetailToProcedureType = (
  detail: TreatmentRecordDetailApiData
): ProcedureType | undefined =>
  detail.service_types.map(type => PROCEDURE_TYPE_BY_SERVICE_TYPE[type]).find(Boolean);

export const mapDetailToPhotoItems = (detail: TreatmentRecordDetailApiData): PhotoItem[] =>
  [...(detail.photos ?? [])]
    .filter(hasPhotoUrl)
    .sort((firstPhoto, secondPhoto) => firstPhoto.sort_order - secondPhoto.sort_order)
    .map(photo => ({
      id: photo.photo_id,
      src: photo.photo_url,
      isObjectUrl: false,
    }));

/**
 * 폼 값을 수정 요청 본문으로 바꾼다.
 * 비운 값은 null로 보내 서버에서 지우고, 가격은 금액과 통화를 함께 보내거나 함께 뺀다.
 */
export const mapFormValuesToUpdateRequest = (
  formValues: RecordFormValues,
  procedureType: ProcedureType,
  rating: number
): UpdateTreatmentRecordRequest => {
  const priceAmount = toPriceAmount(formValues.price);

  return {
    service_types: [SERVICE_TYPE_BY_PROCEDURE_TYPE[procedureType]],
    salon_name: formValues.salon.trim() || null,
    designer_name: formValues.designer.trim() || null,
    ...(formValues.date ? { performed_at: toPerformedAt(formValues.date) } : {}),
    // 서버가 1~5만 받으므로 그 밖의 값은 보내지 않는다.
    ...(rating >= 1 && rating <= 5 ? { satisfaction: rating } : {}),
    price_amount: priceAmount,
    price_currency: priceAmount === null ? null : PRICE_CURRENCY,
    memo: formValues.details.trim() || null,
  };
};

export const mapFormValuesToCreateRequest = (
  formValues: RecordFormValues,
  procedureType: ProcedureType,
  rating: number
): CreateTreatmentRecordRequest => {
  const priceAmount = toPriceAmount(formValues.price);
  const performedAtDate = formValues.date || getTodayDateValue();

  return {
    service_types: [SERVICE_TYPE_BY_PROCEDURE_TYPE[procedureType]],
    performed_at: toPerformedAt(performedAtDate),
    salon_name: formValues.salon.trim() || null,
    designer_name: formValues.designer.trim() || null,
    satisfaction: rating >= 1 && rating <= 5 ? rating : null,
    price_amount: priceAmount,
    price_currency: priceAmount === null ? null : PRICE_CURRENCY,
    memo: formValues.details.trim() || null,
  };
};

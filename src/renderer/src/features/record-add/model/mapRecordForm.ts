import { createDateValue, parseDateValue } from "@/entities/record/model/date";
import { getTreatmentRecordPhotoDisplayUrl } from "@/entities/record/model/photo";
import type { ProcedureType } from "@/entities/record/model/constants";
import type { PhotoItem, RecordFormValues } from "@/entities/record/model/types";
import type {
  AddTreatmentRecordPhotoRequest,
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

/** 숫자만 남겨 가격으로 쓴다. 값이 없거나 숫자가 아니면 null로 보내 서버에서 지운다. */
const toPriceAmount = (price: string) => {
  const digitsOnly = price.replace(/[^0-9]/g, "");

  return digitsOnly ? Number(digitsOnly) : null;
};

/** 숫자만 남겨 소요 시간(분)으로 쓴다. 값이 없거나 숫자가 아니면 null로 보내 서버에서 지운다. */
const toDurationMinutes = (duration: string) => {
  const digitsOnly = duration.replace(/[^0-9]/g, "");

  return digitsOnly ? Number(digitsOnly) : null;
};

const hasPhotoUrl = (
  photo: TreatmentRecordPhotoApiData
): photo is TreatmentRecordPhotoApiData & ({ display_url: string } | { photo_url: string }) =>
  getTreatmentRecordPhotoDisplayUrl(photo).length > 0;

const hasUploadFile = (photo: PhotoItem): photo is PhotoItem & { file: File } =>
  photo.file !== undefined;

/** 서버 상세 응답을 수정 폼의 초기값으로 바꾼다 */
export const mapDetailToFormValues = (detail: TreatmentRecordDetailApiData): RecordFormValues => ({
  date: toFormDate(detail.performed_at),
  salon: detail.salon_name ?? "",
  price: detail.price ? String(detail.price.amount) : "",
  duration: detail.duration_minutes ? String(detail.duration_minutes) : "",
  designer: detail.designer_name ?? "",
  procedureContent: detail.treatment_content ?? "",
  details: detail.memo ?? "",
});

/** 폼에 없는 시술 종류(탈색·스타일링·기타)는 고를 칸이 없어 버린다 */
export const mapDetailToProcedureTypes = (detail: TreatmentRecordDetailApiData): ProcedureType[] =>
  detail.service_types
    .map(type => PROCEDURE_TYPE_BY_SERVICE_TYPE[type])
    .filter((procedureType): procedureType is ProcedureType => Boolean(procedureType));

export const mapDetailToPhotoItems = (detail: TreatmentRecordDetailApiData): PhotoItem[] =>
  [...(detail.photos ?? [])]
    .filter(hasPhotoUrl)
    .sort((firstPhoto, secondPhoto) => firstPhoto.sort_order - secondPhoto.sort_order)
    .map(photo => ({
      id: photo.photo_id,
      src: getTreatmentRecordPhotoDisplayUrl(photo),
      isObjectUrl: false,
    }));

export const mapPhotoItemsToAddRequests = (photos: PhotoItem[]): AddTreatmentRecordPhotoRequest[] =>
  photos.flatMap((photo, index) =>
    hasUploadFile(photo)
      ? [
          {
            file: photo.file,
            image_type: "AFTER",
            sort_order: index,
          },
        ]
      : []
  );

/**
 * 폼 값을 수정 요청 본문으로 바꾼다.
 * 비운 값은 null로 보내 서버에서 지우고, 가격은 금액과 통화를 함께 보내거나 함께 뺀다.
 */
export const mapFormValuesToUpdateRequest = (
  formValues: RecordFormValues,
  procedureTypes: ProcedureType[],
  rating: number
): UpdateTreatmentRecordRequest => {
  const priceAmount = toPriceAmount(formValues.price);

  return {
    service_types: procedureTypes.map(type => SERVICE_TYPE_BY_PROCEDURE_TYPE[type]),
    salon_name: formValues.salon.trim() || null,
    designer_name: formValues.designer.trim() || null,
    ...(formValues.date ? { performed_at: toPerformedAt(formValues.date) } : {}),
    // 1~5 밖의 값(아직 안 고른 0 등)은 보내지 않는다. 0.5 단위는 그대로 보낸다.
    ...(rating >= 1 && rating <= 5 ? { satisfaction: rating } : {}),
    duration_minutes: toDurationMinutes(formValues.duration),
    treatment_content: formValues.procedureContent.trim() || null,
    price_amount: priceAmount,
    price_currency: priceAmount === null ? null : PRICE_CURRENCY,
    memo: formValues.details.trim() || null,
  };
};

export const mapFormValuesToCreateRequest = (
  formValues: RecordFormValues,
  procedureTypes: ProcedureType[],
  rating: number
): CreateTreatmentRecordRequest => {
  const priceAmount = toPriceAmount(formValues.price);

  return {
    service_types: procedureTypes.map(type => SERVICE_TYPE_BY_PROCEDURE_TYPE[type]),
    performed_at: toPerformedAt(formValues.date),
    salon_name: formValues.salon.trim() || null,
    designer_name: formValues.designer.trim() || null,
    satisfaction: rating >= 1 && rating <= 5 ? rating : null,
    duration_minutes: toDurationMinutes(formValues.duration),
    treatment_content: formValues.procedureContent.trim() || null,
    price_amount: priceAmount,
    price_currency: priceAmount === null ? null : PRICE_CURRENCY,
    memo: formValues.details.trim() || null,
  };
};

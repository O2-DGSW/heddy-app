import { lightTheme, font } from "@heddy/design-tokens";

import {
  ProcedureTypeSelector,
  RECORD_DETAIL_FIELDS,
  RECORD_DURATION_FIELD,
  RECORD_FIELDS,
  RecordPhotoUploader,
  RecordRatingField,
  RecordTextField,
} from "@/entities/record";
import type { PhotoItem, ProcedureType, RecordFormValues } from "@/entities/record";
import { cn } from "@/shared";

import { useRecordAddForm } from "../../model";
import RecordDatePickerField from "../RecordDatePickerField";

export interface RecordFormSubmitValues {
  formValues: RecordFormValues;
  photos: PhotoItem[];
  procedureTypes: ProcedureType[];
  rating: number;
}

interface RecordAddFormProps {
  onCancel: () => void;
  /** 수정 화면이면 기존 값에서 시작하고 버튼 문구가 바뀐다 */
  mode?: "create" | "edit";
  initialValues?: RecordFormValues;
  initialPhotos?: PhotoItem[];
  initialProcedureTypes?: ProcedureType[];
  initialRating?: number;
  isSubmitting?: boolean;
  onSubmitValues?: (values: RecordFormSubmitValues) => void;
}

const closeButtonStyle = {
  backgroundColor: lightTheme.background.alternative,
  borderColor: lightTheme.fill.neutral,
  color: lightTheme.label.alternative,
};
const saveButtonStyle = {
  backgroundColor: lightTheme.primary.normal,
  color: lightTheme.label.buttonText,
};

const RecordAddForm = ({
  onCancel,
  mode = "create",
  initialValues,
  initialPhotos,
  initialProcedureTypes,
  initialRating,
  isSubmitting,
  onSubmitValues,
}: RecordAddFormProps) => {
  const isEditMode = mode === "edit";

  const {
    formErrors,
    formValues,
    isPhotoLimitReached,
    photoInputRef,
    photos,
    rating,
    selectedProcedureTypes,
    handleDateChange,
    handleDetailsChange,
    handleFieldChange,
    handleOpenPhotoPicker,
    handlePhotoSelection,
    handleProcedureTypeToggle,
    handleRatingChange,
    handleRemovePhoto,
    handleSubmit,
  } = useRecordAddForm({
    initialValues,
    initialPhotos,
    initialProcedureTypes,
    initialRating,
    onSubmit: () => {
      onSubmitValues?.({ formValues, photos, procedureTypes: selectedProcedureTypes, rating });
    },
  });

  return (
    <form
      className="mx-auto flex w-full max-w-[391px] flex-col items-center gap-[clamp(22px,3.4dvh,28px)] px-[clamp(14px,4.2vw,20px)] pb-[clamp(20px,3.4dvh,30px)] pt-[clamp(8px,1.5dvh,12px)]"
      onSubmit={handleSubmit}
    >
      {/* 필수 항목(사진·날짜·시술 종류·소요 시간)을 위로 모아, 아래로 내리지 않아도 저장에 필요한 게 다 보이게 한다 */}
      <RecordPhotoUploader
        errorMessage={formErrors.photos}
        inputRef={photoInputRef}
        isPhotoLimitReached={isPhotoLimitReached}
        onOpenPhotoPicker={handleOpenPhotoPicker}
        onPhotoSelection={handlePhotoSelection}
        onRemovePhoto={handleRemovePhoto}
        photos={photos}
      />

      <RecordDatePickerField
        errorMessage={formErrors.date}
        onChange={handleDateChange}
        value={formValues.date}
      />

      <ProcedureTypeSelector
        errorMessage={formErrors.procedureType}
        onToggle={handleProcedureTypeToggle}
        selectedProcedureTypes={selectedProcedureTypes}
      />

      <RecordTextField
        errorMessage={formErrors.duration}
        inputMode={RECORD_DURATION_FIELD.inputMode}
        isRequired
        label={RECORD_DURATION_FIELD.label}
        name={RECORD_DURATION_FIELD.id}
        onChange={handleFieldChange(RECORD_DURATION_FIELD.id)}
        placeholder={RECORD_DURATION_FIELD.placeholder}
        value={formValues[RECORD_DURATION_FIELD.id]}
      />

      {/* 여기부터는 선택 입력 */}
      {RECORD_FIELDS.map(field => (
        <RecordTextField
          inputMode={field.inputMode}
          key={field.id}
          label={field.label}
          name={field.id}
          onChange={handleFieldChange(field.id)}
          placeholder={field.placeholder}
          value={formValues[field.id]}
        />
      ))}

      <RecordRatingField onChange={handleRatingChange} rating={rating} />

      {RECORD_DETAIL_FIELDS.map(field => (
        <RecordTextField
          inputMode={field.inputMode}
          key={field.id}
          label={field.label}
          name={field.id}
          onChange={handleFieldChange(field.id)}
          placeholder={field.placeholder}
          value={formValues[field.id]}
        />
      ))}

      <RecordTextField
        label="메모"
        maxLength={500}
        multiline
        name="details"
        onChange={handleDetailsChange}
        placeholder="(선택) 메모를 입력해 주세요."
        value={formValues.details}
      />

      <div className="grid w-full shrink-0 grid-cols-2 gap-[7px] pt-[clamp(8px,1.6dvh,12px)]">
        <button
          className={cn(font.headline2.semiBold, "h-[42px] rounded-[10px] border border-solid")}
          onClick={onCancel}
          style={closeButtonStyle}
          type="button"
        >
          {isEditMode ? "취소" : "닫기"}
        </button>
        <button
          className={cn(font.headline2.semiBold, "h-[42px] rounded-[10px] border-0")}
          disabled={isSubmitting}
          style={saveButtonStyle}
          type="submit"
        >
          {isSubmitting ? "저장 중" : isEditMode ? "수정 완료" : "저장"}
        </button>
      </div>
    </form>
  );
};

export default RecordAddForm;

import { lightTheme, font } from "@heddy/design-tokens";

import {
  ProcedureTypeSelector,
  RECORD_DETAIL_FIELDS,
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
  procedureType: ProcedureType;
  rating: number;
}

interface RecordAddFormProps {
  onCancel: () => void;
  /** 수정 화면이면 기존 값에서 시작하고 버튼 문구가 바뀐다 */
  mode?: "create" | "edit";
  initialValues?: RecordFormValues;
  initialPhotos?: PhotoItem[];
  initialProcedureType?: ProcedureType;
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
  initialProcedureType,
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
    selectedProcedureType,
    handleDateChange,
    handleDetailsChange,
    handleFieldChange,
    handleOpenPhotoPicker,
    handlePhotoSelection,
    handleProcedureTypeChange,
    handleRatingChange,
    handleRemovePhoto,
    handleSubmit,
  } = useRecordAddForm({
    initialValues,
    initialPhotos,
    initialProcedureType,
    initialRating,
    onSubmit: () => {
      if (!selectedProcedureType) {
        return;
      }

      onSubmitValues?.({ formValues, photos, procedureType: selectedProcedureType, rating });
    },
  });

  return (
    <form
      className="mx-auto flex w-full max-w-[391px] flex-col items-center gap-[clamp(22px,3.4dvh,28px)] px-[clamp(14px,4.2vw,20px)] pb-[clamp(20px,3.4dvh,30px)] pt-[clamp(8px,1.5dvh,12px)]"
      onSubmit={handleSubmit}
    >
      <RecordPhotoUploader
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

      <ProcedureTypeSelector
        errorMessage={formErrors.procedureType}
        onChange={handleProcedureTypeChange}
        selectedProcedureType={selectedProcedureType}
      />

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

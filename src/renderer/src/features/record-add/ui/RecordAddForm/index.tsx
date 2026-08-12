import { lightTheme, font } from "@heddy/design-tokens";

import {
  ProcedureTypeSelector,
  RECORD_FIELDS,
  RecordPhotoUploader,
  RecordRatingField,
  RecordTextField,
} from "@/entities/record";
import { cn } from "@/shared";

import { useRecordAddForm } from "../../model";
import RecordDatePickerField from "../RecordDatePickerField";

interface RecordAddFormProps {
  onCancel: () => void;
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

const RecordAddForm = ({ onCancel }: RecordAddFormProps) => {
  const {
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
  } = useRecordAddForm();

  return (
    <form className="flex flex-col items-center gap-[28px] pt-[10px]" onSubmit={handleSubmit}>
      <RecordPhotoUploader
        inputRef={photoInputRef}
        isPhotoLimitReached={isPhotoLimitReached}
        onOpenPhotoPicker={handleOpenPhotoPicker}
        onPhotoSelection={handlePhotoSelection}
        onRemovePhoto={handleRemovePhoto}
        photos={photos}
      />

      <RecordDatePickerField onChange={handleDateChange} value={formValues.date} />

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
        onChange={handleProcedureTypeChange}
        selectedProcedureType={selectedProcedureType}
      />

      <RecordRatingField onChange={handleRatingChange} rating={rating} />

      <RecordTextField
        label="상세 내용"
        maxLength={500}
        multiline
        name="details"
        onChange={handleDetailsChange}
        placeholder="(선택) 상세 내용을 입력해 주세요."
        value={formValues.details}
      />

      <div className="grid w-[363px] grid-cols-[178px_178px] gap-[7px] pt-[10px]">
        <button
          className={cn(font.headline2.semiBold, "h-[42px] rounded-[10px] border border-solid")}
          onClick={onCancel}
          style={closeButtonStyle}
          type="button"
        >
          닫기
        </button>
        <button
          className={cn(font.headline2.semiBold, "h-[42px] rounded-[10px] border-0")}
          style={saveButtonStyle}
          type="submit"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default RecordAddForm;

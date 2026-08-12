import { font, lightTheme, palette } from "@heddy/design-tokens";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "../../../../shared";
import recordPhoto from "../../assets/images/record-photo.png";
import arrowIcon from "../../assets/svg/arrow.svg";
import dateIcon from "../../assets/svg/date.svg";
import pictureIcon from "../../assets/svg/picture.svg";
import removeIcon from "../../assets/svg/remove.svg";
import starActiveIcon from "../../assets/svg/star-active.svg";
import starDisabledIcon from "../../assets/svg/star-disabled.svg";

const MAX_PHOTO_COUNT = 10;
const PROCEDURE_TYPES = ["#커트", "#펌", "#염색", "#클리닉"] as const;

type RecordFieldNameType = "salon" | "price" | "designer" | "duration";

interface RecordFormValues {
  date: string;
  salon: string;
  price: string;
  designer: string;
  duration: string;
  details: string;
}

interface RecordFieldConfig {
  id: RecordFieldNameType;
  label: string;
  placeholder: string;
  inputMode: "decimal" | "text";
}

interface PhotoItem {
  id: string;
  src: string;
  isObjectUrl: boolean;
}

type PlaceholderStyle = CSSProperties & {
  "--placeholder-color": string;
};

const RECORD_FIELDS = [
  { id: "salon", label: "미용실", placeholder: "미용실", inputMode: "text" },
  { id: "price", label: "가격", placeholder: "가격", inputMode: "decimal" },
  {
    id: "designer",
    label: "담당 디자이너",
    placeholder: "담당 디자이너",
    inputMode: "text",
  },
  { id: "duration", label: "소요 시간", placeholder: "소요 시간", inputMode: "text" },
] as const satisfies readonly RecordFieldConfig[];

const INITIAL_FORM_VALUES: RecordFormValues = {
  date: "",
  salon: "",
  price: "",
  designer: "",
  duration: "",
  details: "",
};

const INITIAL_PHOTOS: PhotoItem[] = Array.from({ length: 5 }, (_, index) => ({
  id: `initial-photo-${index + 1}`,
  src: recordPhoto,
  isObjectUrl: false,
}));

const fieldStyle = {
  "--placeholder-color": lightTheme.line.normal,
  backgroundColor: lightTheme.background.neutral,
  color: lightTheme.label.neutral,
} satisfies PlaceholderStyle;

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };
const addPhotoButtonStyle = {
  backgroundColor: lightTheme.background.alternative,
  borderColor: lightTheme.label.disable,
};
const photoRemoveButtonStyle = { backgroundColor: lightTheme.background.normal };
const closeButtonStyle = {
  backgroundColor: lightTheme.background.alternative,
  borderColor: lightTheme.fill.neutral,
  color: lightTheme.label.alternative,
};
const saveButtonStyle = {
  backgroundColor: lightTheme.primary.normal,
  color: lightTheme.label.buttonText,
};

const fieldClassName = cn(
  "h-[53px] w-full rounded-[15px] border-0 px-[17px] outline-none",
  "placeholder:text-[var(--placeholder-color)]",
  font.body.medium
);

const getProcedureButtonStyle = (isSelected: boolean): CSSProperties => ({
  backgroundColor: isSelected ? palette.main[97] : lightTheme.label.buttonText,
  borderColor: isSelected ? lightTheme.primary.normal : lightTheme.fill.neutral,
  color: isSelected ? lightTheme.primary.normal : lightTheme.label.alternative,
});

const RecordAdd2Page = () => {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoIdSequenceRef = useRef(1);
  const objectUrlsRef = useRef(new Set<string>());
  const [formValues, setFormValues] = useState<RecordFormValues>(INITIAL_FORM_VALUES);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [selectedProcedureType, setSelectedProcedureType] =
    useState<(typeof PROCEDURE_TYPES)[number]>("#커트");
  const [rating, setRating] = useState(4);
  const [isDateFieldActive, setIsDateFieldActive] = useState(false);

  const isPhotoLimitReached = photos.length >= MAX_PHOTO_COUNT;

  const handleClose = () => {
    navigate(-1);
  };

  const handleOpenPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const availablePhotoCount = MAX_PHOTO_COUNT - photos.length;
    const selectedFiles = Array.from(event.currentTarget.files ?? []).slice(0, availablePhotoCount);
    const addedPhotos = selectedFiles.map((file): PhotoItem => {
      const src = URL.createObjectURL(file);
      const id = `selected-photo-${photoIdSequenceRef.current}`;
      photoIdSequenceRef.current += 1;
      objectUrlsRef.current.add(src);

      return {
        id,
        src,
        isObjectUrl: true,
      };
    });

    setPhotos(currentPhotos => [...currentPhotos, ...addedPhotos]);
    event.currentTarget.value = "";
  };

  const handleRemovePhoto = (photoId: string) => {
    const removedPhoto = photos.find(photo => photo.id === photoId);

    if (removedPhoto?.isObjectUrl) {
      URL.revokeObjectURL(removedPhoto.src);
      objectUrlsRef.current.delete(removedPhoto.src);
    }

    setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoId));
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    setFormValues(currentValues => ({ ...currentValues, date: value }));
  };

  const handleDateFocus = () => {
    setIsDateFieldActive(true);
  };

  const handleDateBlur = () => {
    if (!formValues.date) {
      setIsDateFieldActive(false);
    }
  };

  const handleFieldChange =
    (fieldName: RecordFieldNameType) => (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget;

      setFormValues(currentValues => ({
        ...currentValues,
        [fieldName]: value,
      }));
    };

  const handleDetailsChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;

    setFormValues(currentValues => ({ ...currentValues, details: value }));
  };

  const handleProcedureTypeChange = (procedureType: (typeof PROCEDURE_TYPES)[number]) => {
    setSelectedProcedureType(procedureType);
  };

  const handleRatingChange = (nextRating: number) => {
    setRating(nextRating);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
      objectUrls.clear();
    };
  }, []);

  return (
    <section
      aria-labelledby="record-add2-title"
      className="min-h-full overflow-x-clip pb-[15px]"
      style={pageStyle}
    >
      <header
        className="sticky top-0 z-10 flex h-[112px] items-center justify-center pt-[54px]"
        style={pageStyle}
      >
        <button
          aria-label="뒤로 가기"
          className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
          onClick={handleClose}
          type="button"
        >
          <span aria-hidden="true" className="relative h-[20px] w-[20px]">
            <img
              alt=""
              className="absolute left-[2.08px] top-[1.67px] h-[16.68px] w-[8.76px]"
              src={arrowIcon}
            />
          </span>
        </button>

        <h1 className={font.headline1.bold} id="record-add2-title" style={headingStyle}>
          기록 추가
        </h1>
      </header>

      <form className="flex flex-col items-center gap-[28px] pt-[10px]" onSubmit={handleSubmit}>
        <div className="flex w-[363px] flex-col gap-[6px]">
          <h2 className={font.headline2.semiBold} style={headingStyle}>
            사진
          </h2>

          <input
            accept="image/heic,image/heif,image/jpeg,image/png,image/webp"
            className="hidden"
            multiple
            onChange={handlePhotoSelection}
            ref={photoInputRef}
            type="file"
          />

          <div className="w-[383px] overflow-x-auto pb-[2px] scrollbar-hidden">
            <div className="flex w-max items-end gap-[11px]">
              <button
                aria-label="사진 추가"
                className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-[10px] border border-solid p-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPhotoLimitReached}
                onClick={handleOpenPhotoPicker}
                style={addPhotoButtonStyle}
                type="button"
              >
                <span className="flex w-[49px] flex-col items-center">
                  <span aria-hidden="true" className="relative h-[49px] w-[49px]">
                    <img
                      alt=""
                      className="absolute left-[10px] top-[11.5px] h-[25px] w-[29px]"
                      src={pictureIcon}
                    />
                  </span>
                  <span className={font.caption.medium} style={{ color: lightTheme.line.normal }}>
                    사진 {photos.length}/{MAX_PHOTO_COUNT}
                  </span>
                </span>
              </button>

              {photos.map((photo, index) => (
                <div className="relative h-[106px] w-[100px] shrink-0" key={photo.id}>
                  <img
                    alt={`선택된 시술 사진 ${index + 1}`}
                    className="absolute bottom-0 left-0 h-[100px] w-[100px] rounded-[10px] object-cover"
                    src={photo.src}
                  />
                  <button
                    aria-label={`사진 ${index + 1} 삭제`}
                    className="absolute right-[-3px] top-0 flex h-[24px] w-[24px] items-center justify-center rounded-full border-0 p-0 shadow-[0_0_6px_rgba(0,0,0,0.07)]"
                    onClick={() => handleRemovePhoto(photo.id)}
                    style={photoRemoveButtonStyle}
                    type="button"
                  >
                    <span aria-hidden="true" className="relative h-[19px] w-[19px]">
                      <img
                        alt=""
                        className="absolute left-[5.5px] top-[5.5px] h-[8px] w-[8px]"
                        src={removeIcon}
                      />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <label className="flex w-[363px] flex-col gap-[10px]">
          <span className={font.headline2.semiBold} style={headingStyle}>
            날짜
          </span>
          <span className="relative block">
            <input
              aria-label="날짜 선택"
              className={cn(
                fieldClassName,
                "pr-[52px] [&::-webkit-calendar-picker-indicator]:absolute",
                "[&::-webkit-calendar-picker-indicator]:inset-0",
                "[&::-webkit-calendar-picker-indicator]:h-full",
                "[&::-webkit-calendar-picker-indicator]:w-full",
                "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
                "[&::-webkit-calendar-picker-indicator]:opacity-0"
              )}
              onBlur={handleDateBlur}
              onChange={handleDateChange}
              onFocus={handleDateFocus}
              placeholder="입력"
              style={fieldStyle}
              type={isDateFieldActive || formValues.date ? "date" : "text"}
              value={formValues.date}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[17px] top-1/2 h-[24px] w-[24px] -translate-y-1/2"
            >
              <img
                alt=""
                className="absolute left-[3px] top-[2px] h-[20px] w-[18px]"
                src={dateIcon}
              />
            </span>
          </span>
        </label>

        {RECORD_FIELDS.map(field => (
          <label className="flex w-[363px] flex-col gap-[10px]" key={field.id}>
            <span className={font.headline2.semiBold} style={headingStyle}>
              {field.label}
            </span>
            <input
              autoComplete="off"
              className={fieldClassName}
              inputMode={field.inputMode}
              name={field.id}
              onChange={handleFieldChange(field.id)}
              placeholder={field.placeholder}
              style={fieldStyle}
              type="text"
              value={formValues[field.id]}
            />
          </label>
        ))}

        <div className="flex w-[363px] flex-col gap-[10px]">
          <h2 className={font.headline2.semiBold} style={headingStyle}>
            시술 종류
          </h2>
          <div className="flex flex-wrap gap-[8px]">
            {PROCEDURE_TYPES.map(procedureType => {
              const isSelected = selectedProcedureType === procedureType;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    font.label.medium,
                    "h-[26px] rounded-[15px] border border-solid px-[8px] py-[4px]"
                  )}
                  key={procedureType}
                  onClick={() => handleProcedureTypeChange(procedureType)}
                  style={getProcedureButtonStyle(isSelected)}
                  type="button"
                >
                  {procedureType}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-[363px] flex-col gap-[10px]">
          <h2 className={font.headline2.semiBold} style={headingStyle}>
            만족도
          </h2>
          <div
            aria-label={`만족도 ${rating}점`}
            className="flex h-[59px] items-center justify-center"
            role="radiogroup"
          >
            {[1, 2, 3, 4, 5].map(ratingValue => (
              <button
                aria-checked={rating === ratingValue}
                aria-label={`${ratingValue}점`}
                className={cn(
                  "flex h-[35px] w-[35px] items-center justify-center border-0 bg-transparent p-0",
                  ratingValue < 5 && "-mr-[3px]"
                )}
                key={ratingValue}
                onClick={() => handleRatingChange(ratingValue)}
                role="radio"
                type="button"
              >
                <img
                  alt=""
                  className="h-[24px] w-[25px]"
                  src={ratingValue <= rating ? starActiveIcon : starDisabledIcon}
                />
              </button>
            ))}
          </div>
        </div>

        <label className="flex w-[363px] flex-col gap-[10px]">
          <span className={font.headline2.semiBold} style={headingStyle}>
            상세 내용
          </span>
          <textarea
            className={cn(
              "h-[113px] w-full resize-none rounded-[15px] border-0 px-[17px] py-[15px] outline-none",
              "placeholder:text-[var(--placeholder-color)]",
              font.body.medium
            )}
            maxLength={500}
            name="details"
            onChange={handleDetailsChange}
            placeholder="(선택) 상세 내용을 입력해 주세요."
            style={fieldStyle}
            value={formValues.details}
          />
        </label>

        <div className="grid w-[363px] grid-cols-[178px_178px] gap-[7px] pt-[10px]">
          <button
            className={cn(font.headline2.semiBold, "h-[42px] rounded-[10px] border border-solid")}
            onClick={handleClose}
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
    </section>
  );
};

export default RecordAdd2Page;

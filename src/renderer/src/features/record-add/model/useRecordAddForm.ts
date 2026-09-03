import { useEffect, useRef, useState } from "react";

import { INITIAL_FORM_VALUES, INITIAL_PHOTOS, MAX_PHOTO_COUNT } from "@/entities/record";

import type { ChangeEvent, FormEvent } from "react";
import type {
  PhotoItem,
  ProcedureType,
  RecordFieldNameType,
  RecordFormValues,
} from "@/entities/record";

type RecordFormErrorKeyType = RecordFieldNameType | "date" | "photos" | "procedureType" | "rating";
type RecordFormErrorsType = Partial<Record<RecordFormErrorKeyType, string>>;

const REQUIRED_FIELD_ERROR_MESSAGE = "필수로 작성해야 합니다.";
const PHOTO_REQUIRED_ERROR_MESSAGE = "사진을 추가해 주세요.";
const REQUIRED_FIELD_NAMES: RecordFieldNameType[] = [
  "salon",
  "price",
  "duration",
  "designer",
  "procedureContent",
];

interface UseRecordAddFormOptions {
  /** 수정 화면처럼 기존 값에서 시작해야 할 때 넘긴다 */
  initialValues?: RecordFormValues;
  initialPhotos?: PhotoItem[];
  initialProcedureType?: ProcedureType;
  initialRating?: number;
  onSubmit?: () => void;
}

export const useRecordAddForm = ({
  initialValues,
  initialPhotos,
  initialProcedureType,
  initialRating,
  onSubmit,
}: UseRecordAddFormOptions = {}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoIdSequenceRef = useRef(1);
  const objectUrlsRef = useRef(new Set<string>());
  const [formValues, setFormValues] = useState<RecordFormValues>(
    initialValues ?? INITIAL_FORM_VALUES
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos ?? INITIAL_PHOTOS);
  const [selectedProcedureType, setSelectedProcedureType] = useState<ProcedureType | null>(
    initialProcedureType ?? null
  );
  const [rating, setRating] = useState(initialRating ?? 0);
  const [formErrors, setFormErrors] = useState<RecordFormErrorsType>({});

  // 초기값 동기화는 따로 하지 않는다. 수정 화면이 서버 값을 받은 뒤에 폼을 렌더하므로
  // 위 useState 초기값만으로 충분하고, 편집 중에 값이 덮어써지는 사고도 막을 수 있다.

  const isPhotoLimitReached = photos.length >= MAX_PHOTO_COUNT;

  const validateForm = () => {
    const nextFormErrors: RecordFormErrorsType = {};

    if (photos.length === 0) {
      nextFormErrors.photos = PHOTO_REQUIRED_ERROR_MESSAGE;
    }

    if (!formValues.date) {
      nextFormErrors.date = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    if (!selectedProcedureType) {
      nextFormErrors.procedureType = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    if (rating < 1 || rating > 5) {
      nextFormErrors.rating = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    REQUIRED_FIELD_NAMES.forEach(fieldName => {
      if (!formValues[fieldName].trim()) {
        nextFormErrors[fieldName] = REQUIRED_FIELD_ERROR_MESSAGE;
      }
    });

    return nextFormErrors;
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

    setPhotos(currentPhotos => [...addedPhotos, ...currentPhotos]);
    setFormErrors(currentErrors => ({ ...currentErrors, photos: undefined }));
    event.currentTarget.value = "";
  };

  const handleRemovePhoto = (photoId: string) => {
    const removedPhoto = photos.find(photo => photo.id === photoId);

    if (removedPhoto?.isObjectUrl) {
      URL.revokeObjectURL(removedPhoto.src);
      objectUrlsRef.current.delete(removedPhoto.src);
    }

    setPhotos(currentPhotos => {
      const nextPhotos = currentPhotos.filter(photo => photo.id !== photoId);

      setFormErrors(currentErrors => ({
        ...currentErrors,
        photos: nextPhotos.length === 0 ? currentErrors.photos : undefined,
      }));

      return nextPhotos;
    });
  };

  const handleDateChange = (date: string) => {
    setFormValues(currentValues => ({ ...currentValues, date }));
    setFormErrors(currentErrors => ({
      ...currentErrors,
      date: date ? undefined : currentErrors.date,
    }));
  };

  const handleFieldChange =
    (fieldName: RecordFieldNameType) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;

      setFormValues(currentValues => ({
        ...currentValues,
        [fieldName]: value,
      }));
      setFormErrors(currentErrors => ({
        ...currentErrors,
        [fieldName]: value.trim() ? undefined : currentErrors[fieldName],
      }));
    };

  const handleDetailsChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;

    setFormValues(currentValues => ({ ...currentValues, details: value }));
  };

  const handleProcedureTypeChange = (procedureType: ProcedureType) => {
    setSelectedProcedureType(procedureType);
    setFormErrors(currentErrors => ({ ...currentErrors, procedureType: undefined }));
  };

  const handleRatingChange = (nextRating: number) => {
    setRating(nextRating);
    setFormErrors(currentErrors => ({
      ...currentErrors,
      rating: nextRating >= 1 && nextRating <= 5 ? undefined : currentErrors.rating,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextFormErrors = validateForm();
    setFormErrors(nextFormErrors);

    if (Object.keys(nextFormErrors).length > 0) {
      return;
    }

    onSubmit?.();
  };

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach(objectUrl => URL.revokeObjectURL(objectUrl));
      objectUrls.clear();
    };
  }, []);

  return {
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
  };
};

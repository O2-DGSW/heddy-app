import { useEffect, useRef, useState } from "react";

import {
  INITIAL_FORM_VALUES,
  INITIAL_PHOTOS,
  MAX_PHOTO_COUNT,
  getTodayDateValue,
} from "@/entities/record";

import { compressPhotoFile } from "./compressPhotoFile";

import type { ChangeEvent, FormEvent } from "react";
import type {
  PhotoItem,
  ProcedureType,
  RecordFieldNameType,
  RecordFormValues,
} from "@/entities/record";

type RecordFormErrorKeyType = "date" | "procedureType" | "duration" | "photos";
type RecordFormErrorsType = Partial<Record<RecordFormErrorKeyType, string>>;

const REQUIRED_FIELD_ERROR_MESSAGE = "필수로 작성해야 합니다.";
const PHOTO_REQUIRED_ERROR_MESSAGE = "사진을 한 장 이상 올려주세요.";

interface UseRecordAddFormOptions {
  /**
   * 수정 화면이면 사진·소요 시간을 필수로 걸지 않는다.
   * 이 규칙이 생기기 전에 만든 기록에는 둘 다 없을 수 있어, 필수로 막으면 메모 한 줄도 고칠 수 없다.
   */
  isEditMode?: boolean;
  /** 수정 화면처럼 기존 값에서 시작해야 할 때 넘긴다 */
  initialValues?: RecordFormValues;
  initialPhotos?: PhotoItem[];
  initialProcedureTypes?: ProcedureType[];
  initialRating?: number;
  onSubmit?: () => void;
}

export const useRecordAddForm = ({
  isEditMode = false,
  initialValues,
  initialPhotos,
  initialProcedureTypes,
  initialRating,
  onSubmit,
}: UseRecordAddFormOptions = {}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoIdSequenceRef = useRef(1);
  const objectUrlsRef = useRef(new Set<string>());
  // 추가 화면은 오늘 시술을 적는 경우가 대부분이라 날짜를 오늘로 채워 두고 시작한다.
  // (수정 화면은 initialValues가 들어와 기존 날짜가 그대로 유지된다.)
  const [formValues, setFormValues] = useState<RecordFormValues>(
    () => initialValues ?? { ...INITIAL_FORM_VALUES, date: getTodayDateValue() }
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos ?? INITIAL_PHOTOS);
  // 압축을 기다리는 동안 다시 사진을 고르면 화면의 photos가 아직 갱신되지 않아 10장 제한이 깨진다.
  // 확정된 장수와 처리 중인 장수를 ref로 세서 고르는 즉시 남은 자리를 계산한다.
  const photoCountRef = useRef((initialPhotos ?? INITIAL_PHOTOS).length);
  const pendingPhotoCountRef = useRef(0);
  // 한 번 방문에 커트+염색처럼 여러 시술을 받는 경우가 있어 여러 개를 고를 수 있다.
  const [selectedProcedureTypes, setSelectedProcedureTypes] = useState<ProcedureType[]>(
    initialProcedureTypes ?? []
  );
  const [rating, setRating] = useState(initialRating ?? 0);
  const [formErrors, setFormErrors] = useState<RecordFormErrorsType>({});

  // 초기값 동기화는 따로 하지 않는다. 수정 화면이 서버 값을 받은 뒤에 폼을 렌더하므로
  // 위 useState 초기값만으로 충분하고, 편집 중에 값이 덮어써지는 사고도 막을 수 있다.

  const isPhotoLimitReached = photos.length >= MAX_PHOTO_COUNT;

  const validateForm = () => {
    const nextFormErrors: RecordFormErrorsType = {};

    if (!formValues.date) {
      nextFormErrors.date = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    if (selectedProcedureTypes.length === 0) {
      nextFormErrors.procedureType = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    // 날짜·시술 종류는 서버도 요구하는 값이라 수정 화면에서도 그대로 막는다.
    // 휠로만 고를 수 있어 숫자가 아닌 값은 들어올 수 없다. 안 골랐는지만 본다.
    if (!isEditMode && !formValues.duration) {
      nextFormErrors.duration = REQUIRED_FIELD_ERROR_MESSAGE;
    }

    if (!isEditMode && photos.length === 0) {
      nextFormErrors.photos = PHOTO_REQUIRED_ERROR_MESSAGE;
    }

    return nextFormErrors;
  };

  const handleOpenPhotoPicker = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    // React는 이벤트 처리가 끝나면 currentTarget을 비운다. await 전에 파일을 꺼내고 입력값을 비워
    // 같은 사진을 다시 고를 수 있게 한다.
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";

    const availablePhotoCount =
      MAX_PHOTO_COUNT - photoCountRef.current - pendingPhotoCountRef.current;
    const selectedFiles = files.slice(0, Math.max(availablePhotoCount, 0));

    if (selectedFiles.length === 0) {
      return;
    }

    pendingPhotoCountRef.current += selectedFiles.length;

    try {
      const addedPhotos = await Promise.all(
        selectedFiles.map(async (file): Promise<PhotoItem> => {
          const uploadFile = await compressPhotoFile(file);
          const src = URL.createObjectURL(uploadFile);
          const id = `selected-photo-${photoIdSequenceRef.current}`;
          photoIdSequenceRef.current += 1;
          objectUrlsRef.current.add(src);

          return {
            file: uploadFile,
            id,
            src,
            isObjectUrl: true,
          };
        })
      );

      photoCountRef.current += addedPhotos.length;
      setPhotos(currentPhotos => [...addedPhotos, ...currentPhotos]);
      setFormErrors(currentErrors => ({ ...currentErrors, photos: undefined }));
    } finally {
      pendingPhotoCountRef.current -= selectedFiles.length;
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    const removedPhoto = photos.find(photo => photo.id === photoId);

    if (removedPhoto?.isObjectUrl) {
      URL.revokeObjectURL(removedPhoto.src);
      objectUrlsRef.current.delete(removedPhoto.src);
    }

    if (removedPhoto) {
      photoCountRef.current -= 1;
    }

    setPhotos(currentPhotos => currentPhotos.filter(photo => photo.id !== photoId));
  };

  const handleDateChange = (date: string) => {
    setFormValues(currentValues => ({ ...currentValues, date }));
    setFormErrors(currentErrors => ({
      ...currentErrors,
      date: date ? undefined : currentErrors.date,
    }));
  };

  const handleDurationChange = (duration: string) => {
    setFormValues(currentValues => ({ ...currentValues, duration }));
    setFormErrors(currentErrors => ({
      ...currentErrors,
      duration: duration ? undefined : currentErrors.duration,
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
    };

  const handleDetailsChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.currentTarget;

    setFormValues(currentValues => ({ ...currentValues, details: value }));
  };

  /** 이미 고른 종류를 다시 누르면 선택을 푼다 */
  const handleProcedureTypeToggle = (procedureType: ProcedureType) => {
    setSelectedProcedureTypes(currentTypes =>
      currentTypes.includes(procedureType)
        ? currentTypes.filter(type => type !== procedureType)
        : [...currentTypes, procedureType]
    );
    setFormErrors(currentErrors => ({ ...currentErrors, procedureType: undefined }));
  };

  const handleRatingChange = (nextRating: number) => {
    setRating(nextRating);
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
    selectedProcedureTypes,
    handleDateChange,
    handleDurationChange,
    handleDetailsChange,
    handleFieldChange,
    handleOpenPhotoPicker,
    handlePhotoSelection,
    handleProcedureTypeToggle,
    handleRatingChange,
    handleRemovePhoto,
    handleSubmit,
  };
};

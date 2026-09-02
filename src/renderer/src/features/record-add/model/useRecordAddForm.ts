import { useEffect, useRef, useState } from "react";

import {
  INITIAL_FORM_VALUES,
  INITIAL_PHOTOS,
  MAX_PHOTO_COUNT,
  PROCEDURE_TYPES,
} from "@/entities/record";

import type { ChangeEvent, FormEvent } from "react";
import type {
  PhotoItem,
  ProcedureType,
  RecordFieldNameType,
  RecordFormValues,
} from "@/entities/record";

export const useRecordAddForm = () => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoIdSequenceRef = useRef(1);
  const objectUrlsRef = useRef(new Set<string>());
  const [formValues, setFormValues] = useState<RecordFormValues>(INITIAL_FORM_VALUES);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [selectedProcedureType, setSelectedProcedureType] = useState<ProcedureType>(
    PROCEDURE_TYPES[0]
  );
  const [rating, setRating] = useState(4);

  const isPhotoLimitReached = photos.length >= MAX_PHOTO_COUNT;

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

  const handleDateChange = (date: string) => {
    setFormValues(currentValues => ({ ...currentValues, date }));
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

  const handleProcedureTypeChange = (procedureType: ProcedureType) => {
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

  return {
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

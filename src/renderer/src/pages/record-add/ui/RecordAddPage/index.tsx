import { useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import {
  arrowIcon,
  useAddTreatmentRecordPhotos,
  useCreateTreatmentRecord,
} from "@/entities/record";
import {
  RecordAddForm,
  mapFormValuesToCreateRequest,
  mapPhotoItemsToAddRequests,
} from "@/features/record-add";
import type { RecordFormSubmitValues } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

const RecordAddPage = () => {
  const navigate = useNavigate();
  const createRecord = useCreateTreatmentRecord();
  const addRecordPhotos = useAddTreatmentRecordPhotos();
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);

  const submitErrorMessage = createRecord.error?.message ?? addRecordPhotos.error?.message ?? null;
  const isSubmitting = createRecord.isPending || addRecordPhotos.isPending;

  const handleClose = () => {
    setDirection("back");
    navigate(-1);
  };

  const handleSubmit = async ({
    formValues,
    photos,
    procedureType,
    rating,
  }: RecordFormSubmitValues) => {
    const photoRequests = mapPhotoItemsToAddRequests(photos);

    try {
      const recordId =
        createdRecordId ??
        (
          await createRecord.mutateAsync(
            mapFormValuesToCreateRequest(formValues, procedureType, rating)
          )
        ).record_id;

      setCreatedRecordId(recordId);

      if (photoRequests.length > 0) {
        await addRecordPhotos.mutateAsync({ recordId, photos: photoRequests });
      }

      handleClose();
    } catch {
      // 오류 메시지는 각 mutation의 error 상태로 화면에 표시한다.
    }
  };

  return (
    <cap-page>
      <section
        aria-labelledby="record-add-title"
        className="flex h-full min-h-0 flex-col overflow-hidden"
        style={pageStyle}
      >
        <header
          className="relative z-10 flex h-[clamp(54px,7dvh,58px)] shrink-0 items-center justify-center"
          style={pageStyle}
        >
          <button
            aria-label="뒤로 가기"
            className="absolute left-[14px] flex h-[44px] w-[44px] items-center justify-start border-0 bg-transparent p-0"
            onClick={handleClose}
            type="button"
          >
            <img alt="" className="h-[20px] w-[20px]" src={arrowIcon} />
          </button>

          <h1 className={font.headline1.bold} id="record-add-title" style={headingStyle}>
            기록 추가
          </h1>
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-contain pb-[clamp(18px,3dvh,26px)] no-scrollbar [-webkit-overflow-scrolling:touch]">
          {submitErrorMessage && (
            <p
              className={`px-4 pt-4 text-center ${font.caption.regular}`}
              style={{ color: lightTheme.status.error }}
            >
              {submitErrorMessage}
            </p>
          )}

          <RecordAddForm
            isSubmitting={isSubmitting}
            onCancel={handleClose}
            onSubmitValues={handleSubmit}
          />
        </div>
      </section>
    </cap-page>
  );
};

export default RecordAddPage;

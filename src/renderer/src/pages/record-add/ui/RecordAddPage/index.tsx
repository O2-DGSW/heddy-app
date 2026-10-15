import { useCallback, useRef, useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import {
  TreatmentRecordPhotoUploadError,
  usePostTreatmentRecordPhotos,
  usePostTreatmentRecord,
} from "@/entities/record";
import {
  RecordAddForm,
  mapFormValuesToCreateRequest,
  mapPhotoItemsToAddRequests,
} from "@/features/record-add";
import { ArrowIcon, ConfirmModal, showErrorToast, useLeaveConfirm } from "@/shared";
import type { RecordFormSubmitValues } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

const SAVE_ERROR_MESSAGE = "시술기록을 저장하지 못했습니다. 다시 시도해 주세요.";

const RecordAddPage = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  // 폼이 알려 주는 저장하지 않은 입력 여부. 나갈 때 되물을지 정한다.
  const [isDirty, setIsDirty] = useState(false);
  const createRecord = usePostTreatmentRecord();
  const addRecordPhotos = usePostTreatmentRecordPhotos();
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);
  // 일부 사진만 올라간 뒤 다시 저장하면 이미 올라간 사진은 건너뛴다
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<string[]>([]);

  const isSubmitting = createRecord.isPending || addRecordPhotos.isPending;

  const handleClose = useCallback(() => {
    setDirection("back");
    navigate(-1);
  }, [navigate]);

  const { isLeaveConfirmOpen, requestLeave, confirmLeave, cancelLeave } = useLeaveConfirm({
    isDirty,
    containerRef: sectionRef,
    onLeave: handleClose,
  });

  const handleSubmit = async ({
    formValues,
    photos,
    procedureTypes,
    rating,
  }: RecordFormSubmitValues) => {
    // mapPhotoItemsToAddRequests는 파일이 있는 사진만 같은 순서로 요청으로 바꾼다(sort_order는 전체 순서)
    const photoRequests = mapPhotoItemsToAddRequests(photos);
    const uploadTargets = photos
      .filter(photo => photo.file !== undefined)
      .map((photo, index) => ({ photoId: photo.id, request: photoRequests[index] }))
      .filter(({ photoId }) => !uploadedPhotoIds.includes(photoId));

    try {
      const recordId =
        createdRecordId ??
        (
          await createRecord.mutateAsync(
            mapFormValuesToCreateRequest(formValues, procedureTypes, rating)
          )
        ).record_id;

      setCreatedRecordId(recordId);

      if (uploadTargets.length > 0) {
        await addRecordPhotos.mutateAsync({
          recordId,
          photos: uploadTargets.map(({ request }) => request),
        });
      }

      handleClose();
    } catch (error) {
      // 폼이 길어 맨 위 문구는 보이지 않을 수 있어 토스트로 알린다.
      showErrorToast(error instanceof Error ? error.message : SAVE_ERROR_MESSAGE);

      if (error instanceof TreatmentRecordPhotoUploadError) {
        const succeededIds = uploadTargets
          .filter((_, index) => !error.failedIndexes.includes(index))
          .map(({ photoId }) => photoId);

        setUploadedPhotoIds(currentIds => [...currentIds, ...succeededIds]);
      }
    }
  };

  return (
    <cap-page>
      <section
        ref={sectionRef}
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
            onClick={requestLeave}
            type="button"
          >
            <ArrowIcon className="h-[20px] w-[20px]" color={lightTheme.label.neutral} />
          </button>

          <h1 className={font.headline1.bold} id="record-add-title" style={headingStyle}>
            기록 추가
          </h1>
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-contain pb-[clamp(18px,3dvh,26px)] no-scrollbar [-webkit-overflow-scrolling:touch]">
          <RecordAddForm
            isSubmitting={isSubmitting}
            onCancel={requestLeave}
            onDirtyChange={setIsDirty}
            onSubmitValues={handleSubmit}
          />
        </div>

        {isLeaveConfirmOpen && (
          <ConfirmModal
            cancelLabel="계속 작성"
            confirmLabel="나가기"
            description="작성한 내용은 저장되지 않습니다."
            onCancel={cancelLeave}
            onConfirm={confirmLeave}
            title="작성을 그만두고 나갈까요?"
            tone="danger"
          />
        )}
      </section>
    </cap-page>
  );
};

export default RecordAddPage;

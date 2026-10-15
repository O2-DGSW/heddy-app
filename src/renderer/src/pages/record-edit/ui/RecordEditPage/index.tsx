import { useCallback, useMemo, useRef, useState } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { useGetTreatmentRecord, usePatchTreatmentRecord } from "@/entities/record";
import {
  RecordAddForm,
  mapDetailToFormValues,
  mapDetailToPhotoItems,
  getUnsupportedServiceTypes,
  mapDetailToProcedureTypes,
  mapFormValuesToUpdateRequest,
  usePutTreatmentRecordPhotos,
} from "@/features/record-add";
import { ArrowIcon, ConfirmModal, showErrorToast, useLeaveConfirm } from "@/shared";
import type { RecordFormSubmitValues } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

/** 기록 추가 화면과 같은 폼을 쓰고, 기존 값을 채운 뒤 버튼만 취소·수정 완료로 바꾼다 */
const SAVE_ERROR_MESSAGE = "시술기록을 수정하지 못했습니다. 다시 시도해 주세요.";

const RecordEditPage = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  // 폼이 알려 주는 저장하지 않은 입력 여부. 나갈 때 되물을지 정한다.
  const [isDirty, setIsDirty] = useState(false);
  const { id } = useParams();
  const { data: record, isPending, isError, error } = useGetTreatmentRecord(id);
  const updateRecord = usePatchTreatmentRecord();
  const syncPhotos = usePutTreatmentRecordPhotos();

  const initialValues = useMemo(
    () => (record ? mapDetailToFormValues(record) : undefined),
    [record]
  );
  // 화면에 칸이 없는 종류(탈색 등)는 고치지 않고 그대로 되돌려 보내야 저장할 때 안 지워진다
  const preservedServiceTypes = useMemo(
    () => (record ? getUnsupportedServiceTypes(record) : []),
    [record]
  );
  const initialProcedureTypes = useMemo(
    () => (record ? mapDetailToProcedureTypes(record) : undefined),
    [record]
  );
  const initialPhotos = useMemo(
    () => (record ? mapDetailToPhotoItems(record) : undefined),
    [record]
  );

  const handleClose = useCallback(() => {
    setDirection("back");
    navigate(-1);
  }, [navigate]);

  const { isLeaveConfirmOpen, requestLeave, confirmLeave, cancelLeave } = useLeaveConfirm({
    isDirty,
    containerRef: sectionRef,
    onLeave: handleClose,
  });

  const isSubmitting = updateRecord.isPending || syncPhotos.isPending;

  const handleSubmit = async ({
    formValues,
    photos,
    procedureTypes,
    rating,
  }: RecordFormSubmitValues) => {
    if (!id) {
      return;
    }

    try {
      await updateRecord.mutateAsync({
        recordId: id,
        body: mapFormValuesToUpdateRequest(
          formValues,
          procedureTypes,
          rating,
          preservedServiceTypes
        ),
      });

      await syncPhotos.mutateAsync({ recordId: id, initialPhotos: initialPhotos ?? [], photos });

      handleClose();
    } catch (error) {
      // 폼이 길어 맨 위 문구는 보이지 않을 수 있어 토스트로 알린다.
      showErrorToast(error instanceof Error ? error.message : SAVE_ERROR_MESSAGE);
    }
  };

  return (
    <cap-page>
      <section
        ref={sectionRef}
        aria-labelledby="record-edit-title"
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

          <h1 className={font.headline1.bold} id="record-edit-title" style={headingStyle}>
            기록 수정
          </h1>
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-contain pb-[clamp(18px,3dvh,26px)] no-scrollbar [-webkit-overflow-scrolling:touch]">
          {(isPending || isError) && (
            <p
              className={`px-4 pt-6 text-center ${font.label.regular}`}
              style={{ color: lightTheme.label.assistive }}
            >
              {isError
                ? (error?.message ?? "시술기록을 불러오지 못했습니다.")
                : "시술기록을 불러오는 중"}
            </p>
          )}

          {/* 기존 값이 도착한 뒤에 폼을 그려야 초기값이 그대로 들어간다 */}
          {!isPending && !isError && (
            <>
              <RecordAddForm
                mode="edit"
                initialProcedureTypes={initialProcedureTypes}
                initialPhotos={initialPhotos}
                initialRating={record?.satisfaction ?? undefined}
                initialValues={initialValues}
                isSubmitting={isSubmitting}
                onCancel={requestLeave}
                onDirtyChange={setIsDirty}
                onSubmitValues={handleSubmit}
              />
            </>
          )}
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

export default RecordEditPage;

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import {
  arrowIcon,
  recordQueryKeys,
  useGetTreatmentRecord,
  useUpdateTreatmentRecord,
} from "@/entities/record";
import {
  RecordAddForm,
  mapDetailToFormValues,
  mapDetailToPhotoItems,
  mapDetailToProcedureType,
  mapFormValuesToUpdateRequest,
  syncRecordPhotos,
} from "@/features/record-add";
import type { RecordFormSubmitValues } from "@/features/record-add";

const pageStyle = { backgroundColor: lightTheme.background.normal };
const headingStyle = { color: lightTheme.label.neutral };

/** 기록 추가 화면과 같은 폼을 쓰고, 기존 값을 채운 뒤 버튼만 취소·수정 완료로 바꾼다 */
const RecordEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: record, isPending, isError, error } = useGetTreatmentRecord(id);
  const updateRecord = useUpdateTreatmentRecord();
  const queryClient = useQueryClient();

  // 사진은 삭제·순서 변경·추가가 섞여 여러 번 호출되므로 한 묶음으로 처리하고, 끝나면 기록을 다시 읽는다.
  const syncPhotos = useMutation({
    mutationFn: syncRecordPhotos,
    onSuccess: (_result, { recordId }) => {
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: recordQueryKeys.lists() });
    },
  });

  const initialValues = useMemo(
    () => (record ? mapDetailToFormValues(record) : undefined),
    [record]
  );
  const initialProcedureType = useMemo(
    () => (record ? mapDetailToProcedureType(record) : undefined),
    [record]
  );
  const initialPhotos = useMemo(
    () => (record ? mapDetailToPhotoItems(record) : undefined),
    [record]
  );

  const handleClose = () => {
    setDirection("back");
    navigate(-1);
  };

  const submitErrorMessage = updateRecord.error?.message ?? syncPhotos.error?.message ?? null;
  const isSubmitting = updateRecord.isPending || syncPhotos.isPending;

  const handleSubmit = async ({
    formValues,
    photos,
    procedureType,
    rating,
  }: RecordFormSubmitValues) => {
    if (!id) {
      return;
    }

    try {
      await updateRecord.mutateAsync({
        recordId: id,
        body: mapFormValuesToUpdateRequest(formValues, procedureType, rating),
      });

      await syncPhotos.mutateAsync({ recordId: id, initialPhotos: initialPhotos ?? [], photos });

      handleClose();
    } catch {
      // 오류 메시지는 각 mutation의 error 상태로 화면에 표시한다.
    }
  };

  return (
    <cap-page>
      <section
        aria-labelledby="record-edit-title"
        className="flex h-full min-h-0 flex-col overflow-hidden"
        style={pageStyle}
      >
        <header
          className="relative z-10 flex h-[58px] shrink-0 items-center justify-center"
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

          <h1 className={font.headline1.bold} id="record-edit-title" style={headingStyle}>
            기록 수정
          </h1>
        </header>

        <div className="min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-scroll overscroll-contain pb-[15px] no-scrollbar [-webkit-overflow-scrolling:touch]">
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
              {submitErrorMessage && (
                <p
                  className={`px-4 pt-4 text-center ${font.caption.regular}`}
                  style={{ color: lightTheme.status.error }}
                >
                  {submitErrorMessage}
                </p>
              )}

              <RecordAddForm
                mode="edit"
                initialProcedureType={initialProcedureType}
                initialPhotos={initialPhotos}
                initialRating={record?.satisfaction ?? undefined}
                initialValues={initialValues}
                isSubmitting={isSubmitting}
                onCancel={handleClose}
                onSubmitValues={handleSubmit}
              />
            </>
          )}
        </div>
      </section>
    </cap-page>
  );
};

export default RecordEditPage;

import { useMemo } from "react";
import { font, lightTheme } from "@heddy/design-tokens";
import { useNavigate, useParams } from "react-router-dom";
import { setDirection } from "@capgo/capacitor-transitions/react";

import { arrowIcon, useGetTreatmentRecord, useUpdateTreatmentRecord } from "@/entities/record";
import {
  RecordAddForm,
  mapDetailToFormValues,
  mapDetailToProcedureType,
  mapFormValuesToUpdateRequest,
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

  const initialValues = useMemo(
    () => (record ? mapDetailToFormValues(record) : undefined),
    [record]
  );
  const initialProcedureType = useMemo(
    () => (record ? mapDetailToProcedureType(record) : undefined),
    [record]
  );

  const handleClose = () => {
    setDirection("back");
    navigate(-1);
  };

  const handleSubmit = ({ formValues, procedureType, rating }: RecordFormSubmitValues) => {
    if (!id) {
      return;
    }

    updateRecord.mutate(
      { recordId: id, body: mapFormValuesToUpdateRequest(formValues, procedureType, rating) },
      { onSuccess: handleClose }
    );
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
              {updateRecord.isError && (
                <p
                  className={`px-4 pt-4 text-center ${font.caption.regular}`}
                  style={{ color: lightTheme.status.error }}
                >
                  {updateRecord.error.message}
                </p>
              )}

              <RecordAddForm
                mode="edit"
                initialProcedureType={initialProcedureType}
                initialRating={record?.satisfaction ?? undefined}
                initialValues={initialValues}
                isSubmitting={updateRecord.isPending}
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

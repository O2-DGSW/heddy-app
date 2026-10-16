import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import {
  getAnalysisJobPhase,
  getAnalysisJobProgress,
  getAnalysisQueryOptions,
  getTreatmentRecordPhotoDisplayUrl,
  MAX_ANALYSIS_JOB_POLL_COUNT,
  recordQueryKeys,
  useGetActiveAnalysisJob,
  useGetAnalysisJob,
  useGetLatestAnalysis,
  useGetTreatmentRecord,
  usePostAnalysis,
  usePostAnalysisJobRetry,
} from "@/entities/record";
import {
  mapAnalysisToResult,
  pickAnalysisPhoto,
  pickAnalysisPhotoUrl,
} from "@/features/cuts/model/mapAnalysis";
import type { CutsAnalysisResult } from "@/features/cuts/model/types/CutsAnalysis.types";

/** 분석완료 화면이 그릴 상태 */
export type CutsAnalysisViewType =
  | { status: "loading" }
  | { status: "load-error"; message: string }
  | { status: "no-photo" }
  | { status: "analyzing"; progress: number | null; isTakingLong: boolean }
  | { status: "failed"; message: string }
  | { status: "unavailable" }
  | { status: "result"; result: CutsAnalysisResult; canReanalyze: boolean };

interface UseCutsAnalysisResult {
  view: CutsAnalysisViewType;
  /** 분석에 쓴(쓸) 사진. 결과의 photo_id가 있으면 그 사진을 띄워 오버레이와 어긋나지 않게 한다 */
  photoUrl: string;
  /** STALE 결과를 지금 사진으로 다시 분석하거나, 요청 자체가 실패했을 때 다시 요청한다 */
  handleRequestAnalysis: () => void;
  /** 실패(FAILED)한 작업을 재시도한다 */
  handleRetry: () => void;
  /** 오래 걸려 확인을 멈춘 작업이나 불러오기 실패를 다시 확인한다 */
  handleRefresh: () => void;
}

const FAILED_MESSAGE = "분석 중에 문제가 생겼어요. 다시 시도해 주세요.";

/**
 * 분석완료 화면의 로직.
 * - 결과가 있으면 바로 보여 준다. 결과가 없고 사진이 있으면 화면에 들어오자마자 분석을 요청한다.
 * - 요청한 작업은 끝날 때까지 상태를 확인하고, 끝나면 결과를 받아 최신 결과 캐시에 바로 넣는다
 *   (최신 결과를 다시 조회하는 왕복을 줄인다).
 */
export const useCutsAnalysis = (recordId: string | undefined): UseCutsAnalysisResult => {
  const queryClient = useQueryClient();
  const latestAnalysis = useGetLatestAnalysis(recordId);
  const { data: record } = useGetTreatmentRecord(recordId);
  const { data: activeJob } = useGetActiveAnalysisJob(recordId);
  const jobQuery = useGetAnalysisJob(activeJob?.job_id);
  const postAnalysis = usePostAnalysis();
  const retryAnalysis = usePostAnalysisJobRetry();
  // 같은 기록에서 자동 요청을 두 번 보내지 않는다(실패 후 다시 보내는 건 사용자 버튼으로만)
  const autoRequestedRecordIdRef = useRef<string | null>(null);

  const analysis = latestAnalysis.data;
  const targetPhoto = useMemo(() => pickAnalysisPhoto(record?.photos), [record?.photos]);
  const result = useMemo(() => (analysis ? mapAnalysisToResult(analysis) : null), [analysis]);
  const photoUrl = useMemo(() => {
    const analyzedPhoto = record?.photos?.find(photo => photo.photo_id === analysis?.photo_id);
    const analyzedPhotoUrl = analyzedPhoto ? getTreatmentRecordPhotoDisplayUrl(analyzedPhoto) : "";

    return analyzedPhotoUrl || pickAnalysisPhotoUrl(record?.photos);
  }, [analysis?.photo_id, record?.photos]);

  const job = jobQuery.data;
  const jobPhase = getAnalysisJobPhase(job);
  const completedAnalysisId = jobPhase === "succeeded" ? job?.analysis_id : null;
  // 결과 객체에는 응답 횟수가 없어 query 상태에서 읽는다. 상태 확인마다 다시 그려지므로 값이 따라온다.
  const jobPollCount = activeJob
    ? (queryClient.getQueryState(recordQueryKeys.analysisJob(activeJob.job_id))?.dataUpdateCount ??
      0)
    : 0;

  const view = ((): CutsAnalysisViewType => {
    if (!recordId) {
      return { status: "load-error", message: "시술기록을 찾을 수 없어요." };
    }

    if (activeJob) {
      if (jobQuery.isError) {
        return { status: "failed", message: jobQuery.error.message };
      }

      if (jobPhase === "failed") {
        return { status: "failed", message: FAILED_MESSAGE };
      }

      if (jobPhase === "unavailable") {
        return { status: "unavailable" };
      }

      return {
        status: "analyzing",
        progress: jobPhase === "succeeded" ? 100 : getAnalysisJobProgress(job),
        isTakingLong: jobPollCount >= MAX_ANALYSIS_JOB_POLL_COUNT,
      };
    }

    if (postAnalysis.isPending || retryAnalysis.isPending) {
      return { status: "analyzing", progress: null, isTakingLong: false };
    }

    const requestError = postAnalysis.error ?? retryAnalysis.error;

    if (requestError) {
      // 모델을 쓸 수 없을 때(503)는 API가 그 안내 문구로 바꿔 던진다
      return { status: "failed", message: requestError.message || FAILED_MESSAGE };
    }

    if (latestAnalysis.isPending) {
      return { status: "loading" };
    }

    if (latestAnalysis.isError) {
      return { status: "load-error", message: latestAnalysis.error.message };
    }

    if (result) {
      return { status: "result", result, canReanalyze: result.isStale && Boolean(targetPhoto) };
    }

    // 사진 목록은 기록 조회로 받는다. 받기 전에 "사진 없음"을 띄우면 잠깐 잘못된 안내가 깜빡인다.
    if (!record) {
      return { status: "loading" };
    }

    if (!targetPhoto) {
      return { status: "no-photo" };
    }

    // 결과가 없고 사진이 있으면 아래 effect가 곧 분석을 요청한다
    return { status: "analyzing", progress: null, isTakingLong: false };
  })();

  const requestAnalysis = () => {
    if (!recordId || !targetPhoto) {
      return;
    }

    retryAnalysis.reset();
    postAnalysis.mutate({ recordId, photoId: targetPhoto.photo_id });
  };

  const handleRequestAnalysis = () => {
    requestAnalysis();
  };

  const handleRetry = () => {
    if (!recordId) {
      return;
    }

    // 작업이 없거나(요청 자체 실패) 작업 상태를 못 읽었으면 새로 요청한다
    if (!activeJob || jobQuery.isError || jobPhase !== "failed") {
      queryClient.setQueryData(recordQueryKeys.activeAnalysisJob(recordId), null);
      requestAnalysis();
      return;
    }

    postAnalysis.reset();
    retryAnalysis.mutate({ recordId, jobId: activeJob.job_id });
  };

  const handleRefresh = () => {
    if (activeJob) {
      void jobQuery.refetch();
      return;
    }

    void latestAnalysis.refetch();
  };

  // 결과가 없는 기록이면 들어오자마자 분석을 요청한다(사용자가 버튼을 찾아 누르는 시간을 없앤다)
  useEffect(() => {
    if (
      !recordId ||
      !targetPhoto ||
      activeJob ||
      !latestAnalysis.isSuccess ||
      latestAnalysis.data !== null ||
      !postAnalysis.isIdle ||
      autoRequestedRecordIdRef.current === recordId
    ) {
      return;
    }

    autoRequestedRecordIdRef.current = recordId;
    postAnalysis.mutate({ recordId, photoId: targetPhoto.photo_id });
  }, [
    activeJob,
    latestAnalysis.data,
    latestAnalysis.isSuccess,
    postAnalysis,
    recordId,
    targetPhoto,
  ]);

  // 작업이 끝나면 결과를 받아 최신 결과 자리에 넣고, 진행 중 작업을 비운다
  useEffect(() => {
    if (!recordId || !completedAnalysisId) {
      return;
    }

    let isActive = true;

    void queryClient
      .fetchQuery(getAnalysisQueryOptions(completedAnalysisId))
      .then(completedAnalysis => {
        if (!isActive) {
          return;
        }

        queryClient.setQueryData(recordQueryKeys.latestAnalysis(recordId), completedAnalysis);
        queryClient.setQueryData(recordQueryKeys.activeAnalysisJob(recordId), null);
      })
      .catch(() => {
        // 결과 단건 조회가 실패하면 최신 결과를 다시 받는 쪽으로 넘긴다
        if (!isActive) {
          return;
        }

        queryClient.setQueryData(recordQueryKeys.activeAnalysisJob(recordId), null);
        void queryClient.invalidateQueries({ queryKey: recordQueryKeys.latestAnalysis(recordId) });
      });

    return () => {
      isActive = false;
    };
  }, [completedAnalysisId, queryClient, recordId]);

  return { view, photoUrl, handleRequestAnalysis, handleRetry, handleRefresh };
};

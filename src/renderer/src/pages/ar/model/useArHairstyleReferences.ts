import { useEffect, useState } from "react";

import { getArHairstyleReferences } from "./useArServerConnection";
import type { ArHairstyleOption } from "./types";

type ArHairstyleReferencesStatusType = "loading" | "success" | "error";

interface UseArHairstyleReferencesResult {
  errorMessage: string | null;
  hairstyleOptions: ArHairstyleOption[];
  status: ArHairstyleReferencesStatusType;
}

export const useArHairstyleReferences = (): UseArHairstyleReferencesResult => {
  const [hairstyleOptions, setHairstyleOptions] = useState<ArHairstyleOption[]>([]);
  const [status, setStatus] = useState<ArHairstyleReferencesStatusType>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadHairstyleReferences = async () => {
      try {
        const nextHairstyleOptions = await getArHairstyleReferences();

        if (!isActive) {
          return;
        }

        setHairstyleOptions(nextHairstyleOptions);
        setStatus("success");
      } catch (error: unknown) {
        if (!isActive) {
          return;
        }

        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "AR 헤어스타일 목록을 불러오지 못했습니다."
        );
      }
    };

    void loadHairstyleReferences();

    return () => {
      isActive = false;
    };
  }, []);

  return { errorMessage, hairstyleOptions, status };
};

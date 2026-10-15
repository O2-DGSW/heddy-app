import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ChangeConsentRequest, ConsentType } from "../../model";
import { putConsentApi } from "../consentApi";
import { consentQueryKeys } from "../query/consentQueryKeys";

interface PutConsentVariables {
  consentType: ConsentType;
  body: ChangeConsentRequest;
}

export const usePutConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ consentType, body }: PutConsentVariables) => putConsentApi(consentType, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consentQueryKeys.all });
    },
  });
};

export type ConsentType =
  | "TERMS_OF_SERVICE"
  | "PRIVACY_POLICY"
  | "AI_TRAINING"
  | "SERVICE_ANALYTICS"
  | "PUSH_NOTIFICATION"
  | "MARKETING_NOTIFICATION";

export interface ConsentStatusResponse {
  consent_type: ConsentType;
  granted: boolean;
  policy_version: string;
  changed_at: string;
}

export interface ConsentsResponse {
  items: ConsentStatusResponse[];
}

export interface ChangeConsentRequest {
  granted: boolean;
  policy_version: string;
}

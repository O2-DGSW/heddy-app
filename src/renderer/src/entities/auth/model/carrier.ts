export type MainCarrier = "SKT" | "KT" | "LG U+";
export type MvnoCarrier = "SKT 알뜰폰" | "KT 알뜰폰" | "LGU+ 알뜰폰";
export type Carrier = MainCarrier | MvnoCarrier;

export const MAIN_CARRIERS: MainCarrier[] = ["SKT", "KT", "LG U+"];
export const MVNO_CARRIERS: MvnoCarrier[] = ["SKT 알뜰폰", "KT 알뜰폰", "LGU+ 알뜰폰"];

const MVNO_CARRIER_SET = new Set<string>(MVNO_CARRIERS);

export const isMvnoCarrier = (carrier: string): carrier is MvnoCarrier =>
  MVNO_CARRIER_SET.has(carrier);

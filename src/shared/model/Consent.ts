export interface Consent {
  id: string;
  consented: boolean;
}

export enum Consents {
  PROFILING = 'profiling_optout',
}

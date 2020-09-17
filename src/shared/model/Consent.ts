export interface Consent {
  id: string;
  consented: boolean;
}

export enum Consents {
  PROFILING = 'profiling_optout',
}

export const ConsentsData: string[] = [Consents.PROFILING];

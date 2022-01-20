export interface Consent {
  id: string;
  name: string;
  description: string;
  consented?: boolean;
}

export enum Consents {
  PROFILING = 'profiling_optout',
  SUPPORTER = 'supporter',
  JOBS = 'jobs',
  HOLIDAYS = 'holidays',
  EVENTS = 'events',
  OFFERS = 'offers',
}

export const CONSENTS_DATA_PAGE: string[] = [Consents.PROFILING];

export const CONSENTS_COMMUNICATION_PAGE: string[] = [Consents.SUPPORTER];

export const CONSENTS_POST_SIGN_IN_PAGE: string[] = [Consents.SUPPORTER];

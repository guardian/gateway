export interface Consent {
  id: string;
  name: string;
  description: string;
  consented?: boolean;
}

export enum Consents {
  PROFILING = 'profiling_optout',
  MARKET_RESEARCH = 'market_research_optout',
  SUPPORTER = 'supporter',
  JOBS = 'jobs',
  HOLIDAYS = 'holidays',
  EVENTS = 'events',
  OFFERS = 'offers',
}

export const CONSENTS_DATA_PAGE: string[] = [Consents.PROFILING];

export const CONSENTS_COMMUNICATION_PAGE: string[] = [
  Consents.MARKET_RESEARCH,
  Consents.SUPPORTER,
  Consents.JOBS,
  Consents.HOLIDAYS,
  Consents.EVENTS,
  Consents.OFFERS,
];

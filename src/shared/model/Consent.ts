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

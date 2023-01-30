import { RequestState } from '../../server/models/Express';

declare global {
  namespace Express {
    export interface Response {
      requestState: RequestState;
    }
  }
}

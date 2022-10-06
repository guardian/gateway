import { OktaUtil } from './lib/helper';

export {};

declare global {
  interface Window {
    OktaUtil?: OktaUtil;
  }
}

import { AB, ABTest } from '@guardian/ab-core';
import { switches } from './abSwitches';
import { abTestTest } from './tests/ab-test-test';

interface ABTestConfiguration {
  abTestSwitches: Record<string, boolean>;
  arrayOfTestObjects: ABTest[];
  pageIsSensitive: false;
  mvtMaxValue: 1000000;
}

export const tests: ABTest[] = [abTestTest];

export const getDefaultABTestConfiguration = (): ABTestConfiguration => ({
  abTestSwitches: switches,
  arrayOfTestObjects: tests,
  mvtMaxValue: 1000000,
  pageIsSensitive: false,
});

export const abTestsForMvtId = (mvtId: number) => {
  const {
    abTestSwitches,
    arrayOfTestObjects,
    mvtMaxValue,
    pageIsSensitive,
  } = getDefaultABTestConfiguration();

  return new AB({
    abTestSwitches,
    arrayOfTestObjects,
    pageIsSensitive,
    mvtMaxValue,
    mvtId,
  });
};

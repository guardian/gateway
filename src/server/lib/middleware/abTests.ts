import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { abTestApiForMvtId, tests } from '@/shared/model/experiments/abTests';
import { exampleTest } from '@/shared/model/experiments/tests/example-test';
import { Participations } from '@guardian/ab-core';
import { Request, NextFunction } from 'express';
import qs from 'query-string';

export const abTestMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  // get forced test variants
  // need to be in { [key: string]: { variant: string } }; type (Participations)
  const queryParamsFromUrl = qs.parseUrl(req.url).query;
  const forcedTestVariants: Participations = {};
  Object.entries(queryParamsFromUrl).forEach(([key, value]) => {
    if (key.startsWith('ab-')) {
      forcedTestVariants[key.replace('ab-', '')] = {
        variant: value as string,
      };
    }
  });
  res.locals.abTesting.forcedTestVariants = forcedTestVariants;

  // set up ab tests for given mvtId
  const abTestAPI = abTestApiForMvtId(
    res.locals.abTesting.mvtId,
    forcedTestVariants,
  );

  // set the abTestAPI for this request chain
  res.locals.abTestAPI = abTestAPI;

  // get a list of tests to run
  const runnableTests = abTestAPI.allRunnableTests(tests);

  // assign the variants to run
  // example:
  // {
  //   ExampleTest: 'variant'
  // }
  runnableTests.forEach((test) => {
    res.locals.abTesting.participations[test.id] = {
      variant: test.variantToRun.id,
    };
  });

  next();
};

export const abTestDemoMiddleware = (
  _: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  // get the AB Test API
  const ABTestAPI = res.locals.abTestAPI;

  // WAYS TO RUN AB TESTS
  // 1) Using the API (recommended)
  // More documentation at https://github.com/guardian/ab-testing#the-api

  // A) Example for getting and running the first possible runnable test:
  // Get the first possible runnable test
  const firstRunnableTest = ABTestAPI.firstRunnableTest(tests);
  // Get the variant information to run
  const variantFromRunnable = firstRunnableTest?.variantToRun;
  // Get the test method which should run
  const testToRun = variantFromRunnable?.test;
  // Run the test method
  console.log(
    'A) API - First Runnable Test - Outcome:',
    testToRun && testToRun({}),
  );

  // B) Example for checking if a user is in a particular test
  // then get the variant, and run the test method
  const runnableTest = ABTestAPI.runnableTest(exampleTest);
  console.log(
    'B) API - Check for Test - Outcome:',
    runnableTest?.variantToRun.test({}),
  );

  // C) Example for checking if a user is in a specific test and variant
  const isUserInVariant = ABTestAPI.isUserInVariant(
    exampleTest.id,
    exampleTest.variants[0].id,
  );
  console.log(
    'C) API - Check for test and variant boolean - Outcome:',
    isUserInVariant,
  );

  // you can use any of the above for conditional logic too
  // example using C)
  if (isUserInVariant) {
    console.log('C) User in a variant');
  } else {
    console.log('C) User not in a variant');
  }

  // 2) Using the ServerState res.locals (not recommended)
  // In the ServerState res.locals, we pass the testId and variant of any tests
  // the user is in, you can check this too.
  // This isn't recommended as the ServerState res.locals only has the test id and variant
  // so may be more complex to run a test using this

  next();
};

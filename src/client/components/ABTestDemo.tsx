import React from 'react';

import { useAB } from '@guardian/ab-react';
import { tests } from '@/shared/model/experiments/abTests';
import { exampleTest } from '@/shared/model/experiments/tests/example-test';
import useClientState from '@/client/lib/hooks/useClientState';

export const ABTestDemo = () => {
  // load the AB Hook
  const ABTestAPI = useAB();

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

  // 2) Using the ClientState (not recommended)
  // In the ClientState, we pass the testId and variant of any tests
  // the user is in, you can check this too.
  // This isn't recommended as the ClientState isn't guaranteed to be available
  // It also only has the test id and variant
  // so may be more complex to run a test using this

  // Example:
  // Load the client state
  const clientState = useClientState();
  // Get the AB Tests from clientState, these are the AB Tests the user is in with
  // format is { [key: string]: { variant: string }}
  const { abTesting: { participations = {} } = {} } = clientState;
  // check if user in a test
  if (participations[exampleTest.id]?.variant === exampleTest.variants[0].id) {
    console.log(
      `2) I'm in the "${exampleTest.id}" test and "${exampleTest.variants[0].id}" variant.`,
    );
  }

  // Why AB Test?
  // In react you could return a different Component:
  if (isUserInVariant) {
    return (
      <h1>
        AB TEST DEMO - In the &quot;{exampleTest.id}&quot; test and the &quot;
        {exampleTest.variants[0].id}&quot; variant.
      </h1>
    );
  } else {
    return (
      <h1>
        AB TEST DEMO - NOT in the &quot;{exampleTest.id}&quot; test and the
        &quot;
        {exampleTest.variants[0].id}&quot; variant.
      </h1>
    );
  }
};

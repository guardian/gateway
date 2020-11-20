# AB Testing Guide

Information about how to setup and run AB Testing in a multitude of ways in this project.

## Framework

The base framework used is [The Guardian's AB Testing Library](https://github.com/guardian/ab-testing).

More framework/API specific documentation is available there.

## How it works

1. **Define the AB test**: Each AB test and their variants are defined in code with configuration such as audience size & offset and impression & success listeners etc
2. **Initialise the library**: The AB Test library is initialised with configuration values such as a user's MVT ID, an array of the above defined A/B tests etc
3. **Use the AB Test API**: The intialisation returns an API that can be used to check if the current user is in a variant of a test along with a variety of other API methods

## Usage in Gateway

There are 2 ways to use AB Tests on Gateway.

1. **Client Side**: Runs on the client/browser, e.g. for showing different components or taking different actions depending on the test in question. Works with SSR too. This is the easiest way to setup and run tests.
2. **Per Request**: The AB test information and API are also available on the ServerState (res.locals) to be untilised within routes/middleware. This is more complex to setup and run, but for example it gives the option of directing users to different routes/flows based on the test in question. 

## Setup a test

The [src/shared/model/experiments/tests](../src/shared/model/experiments/tests) folder contains test definitions for tests that may need to be run.

To create a new test, create a new file, and the test definition using the [information/template](https://github.com/guardian/ab-testing#ab-test-definition) from the library.

In the [abTests.ts](../src/shared/model/experiments/abTests.ts) file, import and add the new test to the `tests` array. This will make it available to the ab testing library and api.

Finally you have to add a switch for the test in the [abSwitches.ts](../src/shared/model/experiments/abSwitches.ts) file, in the `switches` object. The `key` should be `ab` + the `id` from the test definition. For example, if the `id` in the test definition is `ExampleTest`, then the switch key should be `abExampleTest`. The `value` should be a `boolean`, with `true` if the test is enabled, and `false` if the test is disabled.

The [AB Testing Library](https://github.com/guardian/ab-testing) has more information available to setup tests with.

## Running a test

### Client side

See the [`ABTestDemo`](../src/client/components/ABTestDemo.tsx) component for possible ways to run tests on the client.

You can view this demo by adding this component to the [`Main`](../src/client/main.tsx) component.

```tsx
// other imports
...
import { ABTestDemo } from './components/ABTestDemo';
...

export const Main = (props: ClientState) => {
  ...
  return (
    <>
      ...
      <ClientStateProvider clientState={props}>
        {/* This will show the demo above the rest of the app*/}
        <ABTestDemo />
        <GatewayRoutes />
      </ClientStateProvider>
    </>
  );
}
```

### Per request

Running per request is a bit more complicated, as an example, see the [`abTestDemoMiddleware`](../src/server/lib/middleware/abTests.ts) on a possible way of running an AB test on that particular users request.

This can me demoed by adding this middleware to in the [middleware index](../src/server/lib/middleware/index.ts) file, below the ab testing middleware.

```ts
// other imports
...
import {
  abTestDemoMiddleware,
  abTestMiddleware,
} from '@/server/lib/middleware/abTests';
...

export const applyMiddleware = (server: Express): void => {
  ...
  // ab testing middleware
  server.use([mvtIdMiddleware, abTestMiddleware]);

  // ab test demo middleware
  server.use(abTestDemoMiddleware);
}
```

In both demos be sure not to commit the demo changes to production.

## Forcing/Viewing a test

There are 2 ways of forcing yourself into a test:

1. **Recommended:** Use `GU_mvt_id` (or `GU_mvt_id_local`) cookie
2. Use URL parameters

### Cookie (Recommended)

This method requires manually setting the `GU_mvt_id` cookie, or the `GU_mvt_id_local` cookie (if you're on the `DEV` stage).

Use [this simple calculator](https://ab-tests.netlify.app/) to work out what value you need for a particular test. Simply add the AB Test Config information (audience + offset), and the variants in that test. Then modify the MVT ID value until `Is user in test?` is `Yes` and the variant you want is highlighted. Then copy this MVT ID value as the cookie value for the `GU_mvt_id` or `GU_mvt_id_local` cookie.

The library has [useful documentation](https://github.com/guardian/ab-testing#mvtid-calculator) about the calculator.

At first glance this may seem more difficult that using the URL parameters, but the main advantages to this method are:

- Less chance of overrlapping tests
  - URL params set the `forcedTestVariants` parameter in the framework, which may mean that it may overlap with any other tests in that bucket.
- You'll always be in that AB Test throughout the lifetime of the cookie
  - URL parameters are only valid for that single request, which means that tests that rely on multiple requests/routes would be required to add the parameters on every request manually
- More granular control for audience/offset testing
  - As the values are individual buckets, you can fine tune the audience and the offset as required.

### URL Params

You can also force yourself into a test and variant using URL parameters, either in the query parameters (after the `?`) or as a search parameter (after the `#`). This requires knowing the ab test id and the variant name. Also to note, you have to prefix the test id with `ab-`. For example, to force yourself into the `ExampleTest` and the `variant` variant. You could add the parameter onto the URL like this `https://profile.theguardian.com/reset#ab-ExampleTest=variant`.

The advantages to this are that it's simple to do and test, however the parameters may not persist between requests, so might not be able to test a full flow relying on the AB test.

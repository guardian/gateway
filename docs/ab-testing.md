# AB Testing Guide

Information about how to setup and run AB Testing in a multitude of ways in this project.

## Framework

The base framework used is the [The Guardian's AB Testing Library](https://github.com/guardian/ab-testing).

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


# Setup Guide

Need help? Contact the Identity team on [Digital/Identity](https://chat.google.com/room/AAAAFdv9gK8).

## Requirements

- [Node.js](https://nodejs.org) - Version is specified by [.nvmrc](../.nvmrc), run [`$ nvm use`](https://github.com/creationix/nvm#nvmrc) to use it.
  - We use [`yarn`](https://classic.yarnpkg.com/en/) for dependency management, so if using Node, make sure to get yarn too.

## Configuration

## `git` setup

Make sure to set up your git config to ignore certain revisions in `git blame` by running:

```sh
$ git config blame.ignoreRevsFile .git-blame-ignore-revs
```

This will ignore specific revision in `git blame` defined in `.git-blame-ignore-revs` file. This is useful for ignoring large commits that are not relevant to the codebase, e.g. prettier rewrites.

### Nginx

You can setup gateway to use a domain name locally (`https://profile.thegulocal.com`) and alongside identity-frontend by following the instructions from [`identity-platform/nginx`](https://github.com/guardian/identity-platform/tree/master/nginx).

Using nginx is recommended as it secured with HTTPS and has a domain name allowing cookies to be set correctly, especially as many of the flows in gateway rely on Secure, SameSite=strict cookies.

It is also _required_ for development against Okta, as Okta cookies, specifically the session cookie, have to be on the same domain as gateway so that we can use it for API calls.

Nginx will attempt to resolve from gateway first, followed by dotcom/identity second, and finally identity-frontend on the `profile.thegulocal.com` subdomain. It also works as a reverse proxy against Okta for specific paths as mentioned in the reason above.

When using nginx, be sure to set `BASE_URI` environment variable in `.env` to `profile.thegulocal.com` which will set the correct cookie domain and CSP (Content Secure Policy) headers.

Also since Node does not use the system root store, so it won't accept the `*.thegulocal.com` certificates automatically. Instead, you will have to set the `NODE_EXTRA_CA_CERTS` environment variable. The best place to do this would be to add the following to your shell configuration (e.g. `.bashrc` for `bash`/`.zshrc` for `zsh`).

```sh
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```

This ensures that you don't get any certificate errors when running gateway and calling another service running on `thegulocal`, e.g.

```sh
FetchError: request to https://idapi.thegulocal.com/auth?format=cookies failed, reason: unable to verify the first certificate\n
```

### Rate Limiter

We use a Redis backed rate-limiting implementation in Gateway to handle scenarios where we are experiencing a high level of traffic. To read more about the rate limiter implementation and how it is configured, please see [the documentation](./rate-limit/configuration.md).

#### Quick configuration

If you have no intention of developing against the rate limiter, you can copy the example config in `.ratelimit.example.json` to `.ratelimit.json`. This disables rate limiting by default and will completely bypass the Redis connection attempt and the rate limiter middleware.

#### Redis

To work with the rate limiter, you'll need an instance of Redis running locally. Here's a quick start guide for macOS: https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/. An alternative option is to use the Redis docker container provided by the identity-platform project.

Once you have a Redis instance running, populate the `REDIS_HOST`, `REDIS_PASSWORD`, and `REDIS_SSL_ON` env variables with the correct values according to how you have configured your local instance.

If you're running against the identity-platform Redis container, these will be:

```
REDIS_HOST=localhost
REDIS_PASSWORD=redis_password
REDIS_SSL_ON=false
```

#### Full Configuration

Copy the example config in `.ratelimit.example.json` to `.ratelimit.json`. This will be disabled by default, so you'll need to modify the `enabled` flag to be set to `true`.

Here's a quick-start configuration that you can copy-paste into `.ratelimit.json` to get you started:

```json
{
  "enabled": true,
  "settings": {
    "logOnly": false,
    "trackBucketCapacity": false
  },
  "defaultBuckets": {
    "globalBucket": { "capacity": 500, "addTokenMs": 50 }
  }
}
```

When you start Gateway it will first attempt to read from the `RATE_LIMITER_CONFIG` environment variable. If that is not defined, it will read the `.ratelimit.json` file we just made into its configuration.

### Environment File

Populate `.env` files by using the examples from [`.env.example`](../.env.example). The `.env` files should **never** be committed as they store secrets.

Depending on which stage (`DEV` or `CODE`) you want to connect to [Identity API (IDAPI)](https://github.com/guardian/identity), the `IDAPI_CLIENT_ACCESS_TOKEN` and `IDAPI_BASE_URL` variables will be different. If using the S3 config, it will point to the `CODE` instance of IDAPI.

### S3 Config

You can get a preset `.env` file from the S3 private config. Be sure to have the `identity` Janus credentials.

By default Okta points to the `CODE` environment.

With nginx setup (profile.thegulocal.com):

```sh
# In most cases, if just working on Gateway, we point IDAPI to the CODE environment to save having to run IDAPI locally.
# IDAPI pointing to CODE environment
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-idapi-code .env

# IDAPI pointing to DEV environment
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-idapi-dev .env
```

You can enable Okta to point to the `DEV` environment by running the following command:

```sh
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-okta-dev - >> .env
```

Revert to the Okta `CODE` environment by removing the Okta `DEV` config lines in `.env`.

## Running

If using nginx, nginx will look for gateway on port `8861`, so be sure to use that port. You can access gateway on `https://profile.thegulocal.com`, nginx prioritises gateway first.

You can choose to run gateway locally.

### Locally

Firstly make sure your running the version of Node given by `.nvmrc`, if you have `nvm` installed, just run `nvm use`.

Then to install dependencies and start the development server:

```sh
$ make dev
```

If you fancy running both dev commands in a tiled view you can run:

```sh
$ make dev-tile-v # vertical tiling
$ make dev-tile-h # horizontal tiling
```

This adds the environment variables from the `.env` file and starts the development server.

On the first run/ after removing the `build` folder, you may see errors in your console, this is because the `build` folder and project haven't finished compiling yet, just wait for a while for webpack to finish the bundling process.

Once you see `{"level":"info","message":"server running on port 8861"}` in the console, the application is running.

If your build folder is getting quite large, use `make clean-build` to remove the build folder. Then on the next `make dev` command, it will rebuild the application.

You can see the [`makefile`](../makefile) for the full list of commands.

## Debugging

### Client side

This applies to all client side javascript applications, but you can pause execution by adding a `debugger` statement in any file within the `/src/client` directory.

### Server side

A debugger session is started by default when you use the `make dev` command to run the application locally.

To connect your chrome dev tools to the server side debugger you need to:

1. Visit [`chrome://inspect/#devices`](chrome://inspect/#devices) in the chrome browser
2. Click the `Open dedicated DevTools for Node` link
3. Make sure `localhost:9229` is in the connections pane, and add it via the `Add connection` button if not.

You can now pause execution by adding a `debugger` statement in any file within the `/src/server` directory, or adding a breakpoint in your IDE of choice.

## Testing

### Unit Tests

We run unit tests using [`jest`](https://jestjs.io/). Our unit tests are defined in `__tests__` folders spread throughout the `src` directory.

```sh
# for a full ci test (Build, Lint, Unit Tests)
$ make ci
# or for lint and unit tests
$ yarn test
# or unit tests only
$ yarn test:unit
```

#### Running tests

To run all the unit tests:

```sh
$ make test
```

### Integration Tests

Integration tests are provided by [Cypress](https://cypress.io). They are all defined in the `cypress` folder.

First make sure that the development environment isn't running, since the following scripts will set them up automatically.

We now support a development mode that allows you to make code changes to the server without having the restart cypress to check your changes against the tests.

You can also run the tests with the production build (as is done in CI) without the ability to automatically reload the gateway server.

You can then open the test runner in using:

```sh
# to run in dev mode
$ make cypress-mocked-dev
# or to run in production mode
$ make cypress-mocked
```

You can also open the end to end test runner using:

```sh
# to run in dev mode
$ make cypress-ete-dev
# or to run in production mode
$ make cypress-ete
```

You can also run the Okta specific end to end tests using:

```sh
# to run in dev mode
$ make cypress-ete-okta-dev
# or to run in production mode
$ make cypress-ete-okta
```

It's recommended to use the `make` commands rather than calling the file directly e.g `./cypress-ete-okta.sh`
as the test runners use environment variables to check the running mode.

When creating new Cypress test files be sure to add a number to the name of the file so that GitHub actions can detect the test files and determine which machine to run the test on (`*.${{ matrix.group }}.cy.ts`).

e.g. `cypress/integration/mocked/test.1.cy.ts`

This allows us to run the tests in parallel on the CI environment. To determine how many machines we can run the tests on, you can check the `matrix.group` variable in the `.github/workflows/cypress-*.yml` files.

In terms of how Cypress works in github actions, it's kicked off by the `.github/workflows/cypress.yml` file. The workflow only runs on the following events: On `main` branch, on PR `review_request`, and on `workflow_dispatch` which let's us run this from the Actions tab. This workflow will first build the project, upload the build, and then kick off the other Cypress workflows.

The other workflows are defined in the `.github/workflows/cypress-*.yml` files. Namely: `cypress-ete-okta.yml`, `cypress-ete.yml`, `cypress-mocked.yml`, and `cypress-mocked-okta.yml`. These define the environments to run the Cypress E2E tests against Okta, Cypress E2E tests against IDAPI, Cypress mocked tests, and Cypress tests against a mocked Okta API respectively. These workflows only run on `workflow_call`, so they can only run when called by another workflow, namely the `cypress.yml` workflow.

As mentioned previously these are also set to run on a matrix group. This splits the cypress tests out into a parallel set of cypress tests rather than running all the tests on a single machine. This means that by running tests in parallel that they should run slightly faster as each individual matrix machine has less tests to run. It should help with test flakiness, or at least being able to identify which tests are flaky. This is also why we use the `matrix.group` variable in the `.github/workflows/cypress-*.yml` files and append it to the test file name: `*.${{ matrix.group }}.cy.ts`.

## Accessing Gateway on CODE or PROD

To access gateway routes on `CODE` (and `PROD`) alongside the current profile/identity-frontend routes, you'll add the
`GU_GATEWAY` with the value `true` to your cookies.

When you access the `profile.` subdomain, a `GU_GATEWAY` cookie is automatically added with either `true` or `false` value randomly. Make sure the cookie is set to `true` through your browsers developer tools, or alternatively add a `gateway` query parameter to force this to true automatically, examples: `https://profile.theguardian.com/signin?returnUrl=https%3A%2F%2Fwww.theguardian.com&skipConfirmation=false&gateway` or `https://profile.theguardian.com/signin?gateway`.

Once this cookie value is `true`, you'll automatically be directed to the `gateway` routes that have been migrated so far.

## Storybook

You can use [Storybook](https://storybook.js.org/)to build UI components and pages in isolation without having to launch the Gateway server or set up routes.

Simply run the following command to start Storybook locally

```sh
$ yarn storybook
```

There's more documentation on setting up a story in the [development documentation](development.md).

When a git branch is updated on GitHub, a "Chromatic Deploy" action is run which publishes the Storybook to a URL.

It also runs [visual regression tests](https://www.chromatic.com/), and the "UI Tests"§ must pass/be accepted before the PR can be merged. This is used to prevent unintended UI changes from making their way into production.

## IDE Setup

### Visual Studio Code (VSCode)

We recommend using VSCode thanks to it's support for TypeScript and JavaScript, but also for it's extensions that can be shared.

We've included some recommended [extensions](../.vscode/extensions.json) which VSCode will prompt you to install and use on opening this project.

Here's a list of recommended extensions and why we include them:

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)
  - EditorConfig helps maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs.
  - Uses [EditorConfig](https://editorconfig.org/) to override user/workspace settings with settings found in the [`.editorconfig`](.editorconfig) file
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - Integrates [ESLint](https://eslint.org/) into VS Code, to provide automatic linting and typescript checking while writing code.
  - Uses rules from the [`.eslintrc.json`](.eslintrc.json) file.
- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Prettier](https://prettier.io/) is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules.
  - Rules that we've overridden are found in [`.prettierrc`](.prettierrc), and ignored files in [`.prettierignore`](.prettierignore).
- [Visual Studio IntelliCode](https://marketplace.visualstudio.com/items?itemName=visualstudioexptteam.vscodeintellicode)
  - The [Visual Studio IntelliCode](https://visualstudio.microsoft.com/services/intellicode/) extension provides AI-assisted development features for TypeScript/JavaScript in Visual Studio Code, with insights based on understanding your code context combined with machine learning.
  - Essentially provides better code completion from the pop-up completions list by providing context-aware completion.
- [Live Share](https://marketplace.visualstudio.com/items?itemName=ms-vsliveshare.vsliveshare)
  - Visual Studio Live Share enables you to collaboratively edit and debug with others in real time.
  - **_THE_** pairing tool.

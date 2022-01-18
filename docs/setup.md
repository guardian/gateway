# Setup Guide

Need help? Contact the Identity team on [Digital/Identity](https://chat.google.com/room/AAAAFdv9gK8).

## Requirements

Make sure you have one or the other or both:

- [Node.js](https://nodejs.org) - Version is specified by [.nvmrc](../.nvmrc), run [`$ nvm use`](https://github.com/creationix/nvm#nvmrc) to use it.

  - We use [`yarn`](https://classic.yarnpkg.com/en/) for dependency management, so if using Node, make sure to get yarn too.
  - Node and Yarn are not required if running everything through docker.

- [Docker](https://www.docker.com/) - Make sure `docker` and `docker-compose` are available in your terminal.
  - Not required if running everything on your local machine using Node and Yarn.
  - We generally don't recommend Docker due to it's low performance on macOS machines.

## Configuration

### Environment File

Populate a `.env` file by using the examples from [`.env.example`](../.env.example). The `.env` file should **never** be committed.

Depending on which stage (`DEV` or `CODE`) you want to connect to [Identity API (IDAPI)](https://github.com/guardian/identity), the `IDAPI_CLIENT_ACCESS_TOKEN` and `IDAPI_BASE_URL` variables will be different. If using the S3 config, it will point to the `CODE` instance of IDAPI.

### Nginx

You can setup gateway to use a domain name locally (`https://profile.thegulocal.com`) and alongside identity-frontend by following the instructions from [`identity-platform/nginx`](https://github.com/guardian/identity-platform/tree/master/nginx).

Using nginx is recommended as it secured with HTTPS and has a domain name allowing cookies to be set correctly, especially as many of the flows in gateway rely on Secure, SameSite=strict cookies.

Nginx will attempt to resolve from gateway first, followed by dotcom/identity second, and finally identity-frontend on the `profile.thegulocal.com` subdomain.

When using nginx, be sure to set `BASE_URI` environment variable in `.env` to `profile.thegulocal.com` which will set the correct cookie domain and CSP (Content Secure Policy) headers.

Also since Node does not use the system root store, so it won't accept the `*.thegulocal.com` certificates automatically. Instead, you will have to set the `NODE_EXTRA_CA_CERTS` environment variable. The best place to do this would be to add the following to your shell configuration (e.g. `.bashrc` for `bash`/`.zshrc` for `zsh`).

```sh
export NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
```

This ensures that you don't get any certificate errors when running gateway and calling another service running on `thegulocal`, e.g.

```sh
FetchError: request to https://idapi.thegulocal.com/auth?format=cookies failed, reason: unable to verify the first certificate\n
```

### S3 Config

You can get a preset `.env` file from the S3 private config. Be sure to have the `identity` Janus credentials.

Recommended: With nginx setup (profile.thegulocal.com):

```sh
# IDAPI/Okta pointing to DEV environment (Recommended for development)
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-thegulocal-idapi-okta-dev .env

# IDAPI/Okta pointing to CODE environment (Recommended for development against CODE)
# Some cookies may not work due to domain differences
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-thegulocal-idapi-okta-code .env
```

Without nginx (localhost:8861):

```sh
# IDAPI/Okta pointing to DEV environment
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-localhost-idapi-okta-dev .env

# IDAPI/Okta pointing to CODE environment
$ aws s3 cp --profile identity s3://identity-private-config/DEV/identity-gateway/env-localhost-idapi-okta-code .env
```

## Running

If using nginx, nginx will look for gateway on port `8861`, so be sure to use that port. You can access gateway on `https://profile.thegulocal.com`, nginx prioritises gateway first.

If not using nginx, you can then access gateway on `http://localhost:8861`.

You can choose to run gateway locally, or using Docker.

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

### Docker

Development mode can be handled using `docker-compose` using the service name `gateway` if you prefer this way.

To start the development server, navigate to the root project folder with the `docker-compose.yml` file and run:

```sh
$ docker-compose up
```

This spins up a container, builds the project with dependencies, and starts the development server on the port defined in the `.env` file. It also automatically restarts the development server on file changes too.

You can run this in the background using:

```sh
$ docker-compose up -d
```

If running the container in the background, you can access logs using:

```sh
$ docker-compose logs -f
```

You can easily run any commands on the container using:

```sh
$ docker-compose run gateway <COMMAND>
# example
$ docker-compose run gateway make test
# or multiple commands
$ docker-compose run gateway sh -c "yarn && yarn build && yarn test"
```

Finally, to directly access the container shell to run commands use

```sh
$ docker-compose exec gateway /bin/sh
```

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

#### Running tests with Docker

To run all the unit tests:

```sh
$ docker-compose run gateway make test
```

#### Running tests without Docker

To run all the unit tests:

```sh
$ make test
```

### Integration Tests

Integration tests are provided by [Cypress](https://cypress.io). They are all defined in the `cypress` folder.

First make sure that the development environment isn't running, since the following scripts will set them up automatically.

You can then open the test runner using:

```sh
$ make cypress-mocked
# or
$ ./cypress-mocked.sh
```

You can also open the end to end test runner using:

```sh
$ make cypress-ete
# or
$ ./cypress-ete.sh
```

To run the jest tests headless and automatically (how they are run on CI) use:

```sh
$ make ci
# or
$ ./ci.sh
```

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

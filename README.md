# Gateway

## Description

The (new) profile (dot) theguardian (dot) com

Gateway is the new frontend to login and registration at The Guardian at [profile.theguardian.com](https://profile.theguardian.com).

Need help? Contact the Identity team on [Digital/Identity](https://chat.google.com/room/AAAAFdv9gK8).

## Architecture

See the [architecture](docs/architecture.md) doc.

## Setup

A detailed setup guide can be found in [docs/setup](docs/setup.md).

### Quick Start

#### 1. Environment Variables

Populate a `.env` file by using the examples from `.env.example`, or follow the instructions in [docs/setup](docs/setup.md) to download one from S3.
The `.env` file should **never** be committed.

#### 2. Running Locally

3. Install dependencies:

```sh
$ yarn
```

4. Start development server:

```sh
$ make dev
```

On the first run, you may see errors in your console, this is because the `build` folder and project haven't finished compiling yet, just wait for a while for webpack to finish the bundling process.

#### OR 2. Running with Docker

3. Start development server:

```sh
$ docker-compose up -d
```

4. Logs:

```sh
$ docker-compose logs -f
```

## Development Guides

Need help? Check the [development guide](docs/development.md) first!

Other documentation in the [docs](docs) folder.

## Contributing

1. Branch off of `main`, name your branch related to the feature you're implementing, prefix with your initials (e.g. `mm/feature-name`)
2. Do your thing
3. Ensure CI passes by running `make ci` or `./ci.sh`
   - This runs linting, type-check, unit tests, build check, and cypress tests
4. Make sure your branch is up to date with `main`
   - By merging or (preferably, if possible) rebasing onto `main`
   - This makes sure any conflicts are resolved prior to code review
5. Open a pull request
6. Code will be reviewed and require a 👍 from a team member before it will be merged
7. The merger is required to ensure the change is deployed to production.

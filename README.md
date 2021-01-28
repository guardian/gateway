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

Populate a `.env` file by using the examples from `.env.example`, or follow the instructions in [docs/setup](docs/setup.md) to download one from S3. 

The `.env` file should **never** be committed.

#### Docker

Start development server:

```sh
$ docker-compose up -d
```

Logs:

```sh
$ docker-compose logs -f
```

#### Without Docker

Install dependencies:

```sh
$ yarn
```

Start development server:

```sh
$ ./start-dev.sh
# or
$ (set -a && source .env && yarn watch:server & yarn watch & wait)
```

## Development Guides

Need help? Check the [development guide](docs/development.md) first!

Other documentation in the [docs](docs) folder.

## Contributing

1. Branch off of `main`, name your branch related to the feature you're
   implementing, prefix with your initials (e.g. `mm/feature-name`)
2. Do your thing
3. Ensure unit tests pass locally with `yarn test`, and integration tests with `yarn cypress run`
4. Make sure your branch is up to date with `main`
   - by merging or (preferably, if possible) rebasing onto `main`
   - this makes sure any conflicts are resolved prior to code review
5. Open a pull request
6. Code will be reviewed and require a 👍 from a team member before it
   will be merged
7. The merger is required to ensure the change is deployed to production.

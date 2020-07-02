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

Populate a `.env` file by using the examples from `.env.example`. The `.env` file should **never** be committed.

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
$ (set -a && source .env && yarn watch:server & yarn watch & wait)
```

## Development Guides

Need help? Check the [development guide](docs/development.md) first!

Other documentation in the [docs](docs) folder.

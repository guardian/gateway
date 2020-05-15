# Gateway

## Description
The (new) profile (dot) theguardian (dot) com - PROTOTYPE.

Note: all choices made in this project are subject to change!

Need help? Contact the Identity team on [Digital/Identity](https://chat.google.com/room/AAAAFdv9gK8).

## Requirements
* [Docker](https://www.docker.com/)
* [docker-compose](https://docs.docker.com/compose/)

## Installation
```
docker build -t gateway .
```

## Setup
Populate a `.env` file by using the examples from `.env.example`. The `.env` file should **never** be committed.

Depending on which stage (`DEV` or `CODE`) you want to connect to [IDAPI](https://github.com/guardian/identity), the `IDAPI_CLIENT_ACCESS_TOKEN` and `IDAPI_BASE_URL` variables will be different.

`PLAY_SESSION_COOKIE_SECRET` should be the `play.crypto.secret` used by [Identity Frontend](https://github.com/guardian/identity-frontend), as found in the `DEV` private configuration. This is used to decode the scala play session cookie, and will only be in use while migration from play is ongoing, and will be removed when migration is complete, or is no longer required.

## Development
Development mode can be handled using `docker-compose` using the service name `gateway`.

For example to start the service in the background:
```sh
$ docker-compose up -d
```

For access to logs:
```sh
$ docker-compose logs -f
```

For running commands:
```sh
$ docker-compose run gateway <COMMAND>
# example
$ docker-compose run gateway yarn
```

And to access the container shell
```sh
$ docker-compose exec gateway /bin/sh
```

While using docker and docker-compose is preferable, you can still run this locally by installing dependencies using `yarn`, followed by `(set -a && source .env && yarn watch:server)` to run the development server.

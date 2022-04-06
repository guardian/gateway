# Gateway

## Description

The (new) profile (dot) theguardian (dot) com

Gateway is the new frontend to sign-in and registration at the Guardian at [profile.theguardian.com](https://profile.theguardian.com).

Need help? Contact the Identity team on [Digital/Identity](https://chat.google.com/room/AAAAFdv9gK8).

## Architecture/Overview

See the [architecture](docs/architecture.md) doc.

## Setup

A detailed setup guide can be found in [docs/setup](docs/setup.md).

### Quick Start

#### 1. Environment Variables

Populate a `.env` file by using the examples from `.env.example`, or follow the instructions in [docs/setup](docs/setup.md) to download one from S3.
The `.env` file should **never** be committed.

#### 2. Running Locally

3. Install dependencies and start development server:

```sh
$ make dev
```

On the first run, you may see errors in your console, this is because the `build` folder and project haven't finished compiling yet, just wait for a while for webpack to finish the bundling process.

## Development Guides

Need help? Check the [development guide](docs/development.md) first!

Other documentation in the [docs](docs) folder.

## Contributing

1. Branch off of `main`, name your branch related to the feature you're implementing, prefix with your initials (e.g. `mm/feature-name`)
2. Do your thing
3. Ensure tests pass:

- `make ci` or `./ci.sh`
  - This runs linting, type-check, unit tests, build checks
- `make cypress-mocked` or `./cypress-mocked`
  - This runs cypress integration tests against a mocked version of [Identity API](https://github.com/guardian/identity)
- `make cypress-ete` or `./cypress-ete`
  - This runs cypress end-to-end tests against the [Identity API](https://github.com/guardian/identity) defined in `.env`
  - Be sure to use sparingly, this relies on [Mailosaur](https://mailosaur.com/) which has a limited number of emails we can test with it each day

4. Make sure your branch is up to date with `main`

- By merging or (preferably, if possible) rebasing onto `main`
- This makes sure any conflicts are resolved prior to code review
- If possible, please clean up the commit history to make each commit a clean change to make it more readable
  - e.g. for example when fixing things from a previous commit, or combining multiple commits into a single feature commit
  - `git rebase -i <starting commit/branch name>` e.g. `git rebase -i origin/main`

5. Open a pull request

- The template can be used for guidance on how to structure the PR, but you don't have to follow it.
- Draft pull requests, and open pull requests with further pushed commits will not run the `Chromatic` and `cypress-ete` on each push/by default.
  - You have to manually opt into running these tests by either marking the draft PR as "Ready for review", or re-requesting a review (usually from "guardian/identity" or a previous reviewer)
  - This change was made to limit the number of builds to Chromatic and emails with Mailosaur to reduce costs with those products

6. Code will be reviewed and require a 👍 from a team member before it will be merged
7. When a PR is merged with `main` branch, it will ensure that the change is deployed to production.

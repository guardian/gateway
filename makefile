.PHONY: build dev tsc lint fix test ci cypress clean-build clean-deps install reinstall upgrade clear

# these means you can run the binaries in node_modules
# like with npm scripts
export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash

# messaging

define log
		@node scripts/log $(1)
endef

define banner
		@node scripts/banner $(1)
endef

# prod
build: clear clean-build install
	$(call log, "building production bundles 📦")
	@corepack pnpm run build
	
build-analyze: clear clean-build install
	$(call log, "building production bundles and analyze bundle size 🕵️📦")
	@corepack pnpm run build:analyze

# dev
setup: clear
	$(call log, "setting up development environment 🛠️")
	$(call log, "enabling pnpm")
	@corepack enable
	@corepack prepare pnpm@latest --activate

dev: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server 👩‍💻")
	@(corepack pnpm run watch:server & corepack pnpm run watch & wait)

dev-tile-v: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server 👩‍💻")
	@(stmux -M -e ERROR -m beep -- [ [ "corepack pnpm run watch" : "corepack pnpm run watch:server" ] ])

dev-tile-h: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server 👩‍💻")
	@(stmux -M -e ERROR -m beep -- [ [ "corepack pnpm run watch" .. "corepack pnpm run watch:server" ] ])

# QA
tsc: clear install
	$(call log, "checking for type errors 🧐")
	@corepack pnpm run tsc

lint: clear install
	$(call log, "checking for lint errors 🧹")
	@corepack pnpm run lint

fix: clear install
	$(call log, "attempting to fix lint errors 🧰")
	@corepack pnpm run lint --fix

test: clear install
	$(call log, "running tests 🧪")
	@corepack pnpm run test --verbose --runInBand
	$(call log, "everything seems 👌")

test-unit: clear install
	$(call log, "running only unit-tests 🧪")
	@corepack pnpm run test:unit --verbose --runInBand
	$(call log, "everything seems 👌")

ci: clear
	$(call log, "running CI 🤖")
	@(./ci.sh)

cypress-mocked: clear
	$(call log, "opening cypress using mocks 🌲")
	@(./cypress-mocked.sh)

cypress-mocked-dev: export DEV_MODE = true
cypress-mocked-dev: clear
	$(call log, "opening cypress in dev mode using mocks 🌲")
	@(./cypress-mocked.sh)

cypress-ete: clear
	$(call log, "opening cypress 🌲")
	@(./cypress-ete.sh)

cypress-ete-dev: export DEV_MODE = true
cypress-ete-dev: clear
	$(call log, "opening cypress 🌲")
	@(./cypress-ete.sh)

cypress-ete-okta: export USE_OKTA = true
cypress-ete-okta: clear
	$(call log, "opening cypress using okta tests 🌲")
	@(./cypress-ete.sh)

cypress-ete-okta-dev: export USE_OKTA = true
cypress-ete-okta-dev: export DEV_MODE = true
cypress-ete-okta-dev: clear
	$(call log, "opening cypress in dev mode using okta tests 🌲")
	@(./cypress-ete.sh)

cypress-mocked-okta: clear
	$(call log, "opening cypress using Okta mocked tests 🌲")
	@(./cypress-mocked-okta.sh)

cypress-mocked-okta-dev: export DEV_MODE = true
cypress-mocked-okta-dev: clear
	$(call log, "opening cypress in dev mode using Okta mocked tests 🌲")
	@(./cypress-mocked-okta.sh)

storybook: clear
	$(call log, "opening storybook 📖")
	@corepack pnpm run storybook

# helpers

clean-build:
	$(call log, "trashing build 🗑️")
	@rm -rf build

clean-deps:
	$(call log, "trashing dependencies 🚮")
	@rm -rf node_modules

install:
	$(call log, "installing dependencies 📦")
	@corepack pnpm install

reinstall: clear clean-deps install
	$(call log, "dependencies have been reinstalled ♻️")

upgrade: clear
	$(call log, "upgrading dependencies 🚀")
	@corepack pnpm update -L -i

clear: # private
	@clear

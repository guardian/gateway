.PHONY: build dev tsc lint fix test ci cypress clean-build clean-deps install reinstall upgrade clear setup

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
build: clear clean-build setup install
	$(call log, "building production bundles 📦")
	@pnpm run build
	
build-analyze: clear clean-build setup install
	$(call log, "building production bundles and analyze bundle size 🕵️📦")
	@pnpm run build:analyze

# dev

setup: clear
	$(call log, "setting up development environment 🛠️")
	$(call log, "enabling pnpm")
	@corepack enable
	@corepack prepare --activate	

dev: clean-build clear setup install
	$(call banner, "gateway is starting")
	$(call log, "starting development server 👩‍💻")
	@(pnpm run watch:server & pnpm run watch & wait)

# QA
tsc: clear install
	$(call log, "checking for type errors 🧐")
	@pnpm run tsc

lint: clear install
	$(call log, "checking for lint errors 🧹")
	@pnpm run lint

fix: clear install
	$(call log, "attempting to fix lint errors 🧰")
	@pnpm run lint --fix

test: clear install
	$(call log, "running tests 🧪")
	@pnpm run test --verbose --runInBand
	$(call log, "everything seems 👌")

test-unit: clear install
	$(call log, "running only unit-tests 🧪")
	@pnpm run test:unit --verbose --runInBand
	$(call log, "everything seems 👌")

ci: clear setup
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

storybook: clear
	$(call log, "opening storybook 📖")
	@pnpm run storybook

# helpers

clean-build:
	$(call log, "trashing build 🗑️")
	@rm -rf build

clean-deps:
	$(call log, "trashing dependencies 🚮")
	@rm -rf node_modules

install:
	$(call log, "installing dependencies 📦")
	@pnpm install

reinstall: clear clean-deps install
	$(call log, "dependencies have been reinstalled ♻️")

upgrade: clear
	$(call log, "upgrading dependencies 🚀")
	@pnpm update -L -i

clear: # private
	@clear

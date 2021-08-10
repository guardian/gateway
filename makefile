.PHONY: build dev tsc lint fix test ci cypress clean-build clean-deps install reinstall upgrade clear check-env

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
	$(call log, "building production bundles")
	@yarn build

# dev

dev: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server")
	@(set -a && source .env && yarn watch:server & yarn watch & wait)

dev-tile-v: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server")
	@(set -a && stmux -M -e ERROR -m beep -- [ [ "yarn watch" : "yarn watch:server" ] ])

dev-tile-h: clean-build clear install
	$(call banner, "gateway is starting")
	$(call log, "starting development server")
	@(stmux -M -e ERROR -m beep -- [ [ "yarn watch" .. "yarn watch:server" ] ])

# QA
tsc: clear install
	$(call log, "checking for type errors")
	@yarn tsc

lint: clear install
	$(call log, "checking for lint errors")
	@yarn lint

fix: clear install
	$(call log, "attempting to fix lint errors")
	@yarn lint --fix

test: clear install
	$(call log, "running tests")
	@yarn test --verbose --runInBand
	$(call log, "everything seems 👌")

ci: clear
	$(call log, "running CI")
	@(./ci.sh)

cypress-mocked: clear
	$(call log, "opening cypress using mocks")
	@(./cypress-mocked.sh)

# helpers

clean-build:
	$(call log, "trashing build")
	@rm -rf build

clean-deps:
	$(call log, "trashing dependencies")
	@rm -rf node_modules

install: check-env
	$(call log, "refreshing dependencies")
	@yarn --silent

reinstall: clear clean-deps install
	$(call log, "dependencies have been reinstalled ♻️")

upgrade: clear
	@yarn upgrade-interactive --latest

clear: # private
	@clear

check-env: # private
	$(call log, "checking environment")
	@node scripts/check-node.js
	@node scripts/check-yarn.js

#!/bin/bash

(set -a && source .env && yarn watch:server & yarn watch & wait)

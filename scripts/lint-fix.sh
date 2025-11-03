#!/bin/bash
export NODE_ENV=development
export BABEL_ENV=development
eslint --config eslint.config.mjs --fix "$@"
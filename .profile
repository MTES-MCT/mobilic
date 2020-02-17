#!/bin/bash
env_vars=API_HOST
for var in $env_vars
do
  eval value=\$$var
  sed -i "s#process.env.$var#'$value'#g" build/index.html
done

#!/usr/bin/env bash

set -e

ROOT_PROJECT_DIR=`dirname "$(python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "${BASH_SOURCE[0]}")"`/..
cd ${ROOT_PROJECT_DIR}

export API_HOST=${REACT_APP_API_HOST}
export PORT=3001
export HOME=nginx
export BUILD_FOLDER=${ROOT_PROJECT_DIR}/build
export DISABLE_FORCE_HTTPS=1

mkdir -p nginx/conf
mkdir -p nginx/logs

erb nginx/base_conf/base_conf.erb > nginx/conf/nginx.conf
cp nginx/base_conf/mime.types nginx/conf/mime.types
erb servers.conf.erb > nginx/conf/servers.conf

nginx -p ${ROOT_PROJECT_DIR}/nginx -c ${ROOT_PROJECT_DIR}/nginx/conf/nginx.conf

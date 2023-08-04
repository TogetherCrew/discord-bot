#!/bin/bash


MONGO="${DB_HOST}:${DB_PORT}"
REDIS="${REDIS_HOST}:${REDIS_PORT}"
RABBITMQ="${RABBIT_HOST}:${RABBIT_PORT}"
echo "Wait for MONGO=${MONGO} and REDIS=${REDIS} and RABBITMQ=${RABBITMQ}"

echo "DB INFO -> ${DB_HOST} ${DB_PORT} ${DB_USER} ${DB_PASSWORD} ${DB_NAME}"

wait-for-it ${MONGO}
wait-for-it ${REDIS}
wait-for-it ${RABBITMQ}



npx jest --coverage --runInBand

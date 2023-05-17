#!/bin/sh

docker build . -t bspn-api

docker-compose -f docker-compose-e2e.yaml up

curl -d @./infrastructure/hasura/triggers/event_schedule.json  -H 'Content-Type: application/json' localhost:8080/v1/metadata
curl -d @./infrastructure/hasura/triggers/event_check.json  -H 'Content-Type: application/json' localhost:8080/v1/metadata
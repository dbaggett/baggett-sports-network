#!/bin/sh

docker-compose -f docker-compose-e2e.yaml up -d

echo 'Waiting for hasura...'
hasura_status=$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:8080/healthz)
until [ $hasura_status -eq '200' ]
do
   hasura_status=$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:8080/healthz)
done
echo 'Hasura is up and healthy'

curl -d @./infrastructure/hasura/tables/metadata.json  -H 'Content-Type: application/json' localhost:8080/v1/metadata
curl -d @./infrastructure/hasura/triggers/event_check.json  -H 'Content-Type: application/json' localhost:8080/v1/metadata